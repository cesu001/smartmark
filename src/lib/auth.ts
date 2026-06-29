import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { loginLimiter } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const xff = (req?.headers as Record<string, string> | undefined)?.[
          "x-forwarded-for"
        ];
        const ip = xff ? xff.split(",")[0].trim() : "127.0.0.1";
        const identifier = `${ip}:${credentials.email}`;
        try {
          const { success, reset } = await loginLimiter.limit(identifier);
          if (!success) {
            const retryAfterSecs = Math.ceil((reset - Date.now()) / 1000);
            const minutes = Math.max(1, Math.ceil(retryAfterSecs / 60));
            throw new Error(
              `Too many login attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
            );
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith("Too many")) throw e;
          // Fail open — allow request if Upstash is unavailable
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordCorrect) {
          throw new Error("Invalid email or password");
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
