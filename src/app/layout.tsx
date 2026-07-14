import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://smark.tw",
  ),
  title: {
    default: "Smark — AI-powered Markdown notes & knowledge base",
    template: "%s · Smark",
  },
  description:
    "Smark is an AI-powered Markdown note app with semantic search, an AI chatbot, and AI summaries — find your notes by meaning, not just keywords.",
  applicationName: "Smark",
  openGraph: {
    type: "website",
    siteName: "Smark",
    title: "Smark — AI-powered Markdown notes & knowledge base",
    description:
      "Capture Markdown notes and retrieve them by meaning with AI semantic search and an AI chatbot.",
    url: "/",
    // og:image is supplied automatically by src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Smark — AI-powered Markdown notes & knowledge base",
    description:
      "AI-powered Markdown notes with semantic search and an AI chatbot.",
    // twitter:image inherits the opengraph-image automatically
  },
};

export default function RootLayout({
  children,
  authModal,
}: Readonly<{
  children: React.ReactNode;
  authModal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {authModal}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
