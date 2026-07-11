import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/homepage/ScrollReveal";
import { ChaosOrderVisual } from "@/components/homepage/ChaosOrderVisual";

interface HomeHeroProps {
  isLoggedIn: boolean;
}

export function HomeHero({ isLoggedIn }: HomeHeroProps) {
  return (
    <section className="px-6 pt-38 pb-22">
      <ScrollReveal className="mx-auto mb-15 max-w-190 text-center">
        <h1 className="mb-5.5 text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.15] font-extrabold tracking-tight">
          Turn scattered notes into{" "}
          <span className="bg-linear-to-r from-primary via-teal-400 to-primary bg-clip-text text-transparent">
            structured knowledge
          </span>
        </h1>
        <p className="mx-auto mb-7.5 max-w-155 text-[1.05rem] text-muted-foreground">
          Your best ideas are stuck across a dozen tabs, files, and half-finished todos. Smark is
          the AI-powered markdown editor that summarizes and semantically connects every note you
          write — so you spend less time filing, and more time thinking.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          {isLoggedIn ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href="/register">Get Started Free</Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="lg">
            <a href="#features">See how it works</a>
          </Button>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <ChaosOrderVisual />
      </ScrollReveal>
    </section>
  );
}
