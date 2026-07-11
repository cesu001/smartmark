import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/homepage/ScrollReveal";

interface HomeCtaProps {
  isLoggedIn: boolean;
}

export function HomeCta({ isLoggedIn }: HomeCtaProps) {
  return (
    <section className="px-6 py-22 text-center">
      <ScrollReveal className="mx-auto max-w-120">
        <h2 className="mb-3 text-[clamp(1.7rem,3.4vw,2.4rem)] font-extrabold">
          Ready to organize your notes?
        </h2>
        <p className="mx-auto mb-6.5 max-w-120 text-muted-foreground">
          Join Smark today and let AI turn your notes into a knowledge base that actually works
          for you.
        </p>
        <Button asChild size="lg">
          <Link href={isLoggedIn ? "/dashboard" : "/register"}>
            {isLoggedIn ? "Go to Dashboard" : "Get Started — It's Free"}
          </Link>
        </Button>
      </ScrollReveal>
    </section>
  );
}
