import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HomeNavbar } from "@/components/homepage/HomeNavbar";
import { HomeHero } from "@/components/homepage/HomeHero";
import { HomeFeatures } from "@/components/homepage/HomeFeatures";
import { HomeAiSection } from "@/components/homepage/HomeAiSection";
import { HomePricing } from "@/components/homepage/HomePricing";
import { HomeCta } from "@/components/homepage/HomeCta";
import { HomeFooter } from "@/components/homepage/HomeFooter";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session);

  return (
    <div id="top">
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
