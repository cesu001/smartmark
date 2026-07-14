import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HomeNavbar } from "@/components/homepage/HomeNavbar";
import { HomeHero } from "@/components/homepage/HomeHero";
import { HomeFeatures } from "@/components/homepage/HomeFeatures";
import { HomeAiSection } from "@/components/homepage/HomeAiSection";
import { HomePricing } from "@/components/homepage/HomePricing";
import { HomeCta } from "@/components/homepage/HomeCta";
import { HomeFooter } from "@/components/homepage/HomeFooter";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://smark.tw";

export const metadata: Metadata = {
  title: {
    absolute: "Smark — AI Markdown Notes, Semantic Search & Knowledge Base",
  },
  description:
    "Smark is an AI-powered Markdown note app. Write notes in a live editor, organize with collections and tags, and find anything by meaning with AI semantic search, summaries, and a chatbot grounded in your notes.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${APP_URL}/#organization`,
        name: "Smark",
        url: APP_URL,
        logo: `${APP_URL}/opengraph-image`,
      },
      {
        "@type": "WebSite",
        "@id": `${APP_URL}/#website`,
        url: APP_URL,
        name: "Smark",
        description:
          "AI-powered Markdown notes with semantic search, summaries, and an AI chatbot.",
        publisher: { "@id": `${APP_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: "Smark",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        url: APP_URL,
        description:
          "AI-powered Markdown note app with semantic search, AI summaries, and an AI chatbot grounded in your notes.",
        // Both tiers are currently $0 (Pro is free during the launch promo),
        // matching the visible pricing section.
        offers: [
          {
            "@type": "Offer",
            name: "Free",
            price: "0",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            name: "Pro (Launch promo — free)",
            price: "0",
            priceCurrency: "USD",
          },
        ],
      },
    ],
  };

  return (
    <div id="top">
      {/* JSON-LD is structured data, not executable JS; `<` is escaped to prevent injection. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomeNavbar isLoggedIn={isLoggedIn} />
      <main>
        <HomeHero isLoggedIn={isLoggedIn} />
        <HomeFeatures />
        <HomeAiSection />
        <HomePricing />
        <HomeCta isLoggedIn={isLoggedIn} />
      </main>
      <HomeFooter />
    </div>
  );
}
