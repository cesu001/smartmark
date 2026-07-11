"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollReveal } from "@/components/homepage/ScrollReveal";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "Up to 50 notes",
  "Up to 3 collections",
  "Up to 5 tags",
  "Real-time markdown editor",
  "Manual tagging & keyword search",
];

const PRO_FEATURES = [
  "Unlimited notes & collections",
  "Unlimited tags",
  "AI semantic search",
  "AI note summaries",
  "AI chatbot grounded in your notes",
];

export function HomePricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="scroll-mt-20 px-6 py-22">
      <ScrollReveal className="mx-auto mb-12 max-w-155 text-center">
        <span className="mb-2.5 inline-block text-xs font-bold tracking-wider text-primary uppercase">
          Pricing
        </span>
        <h2 className="mb-3 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-tight">
          Simple pricing, no surprises
        </h2>
        <p className="mb-6.5 text-muted-foreground">
          Start free. Upgrade whenever your notes outgrow the basics.
        </p>

        <div className="flex items-center justify-center gap-3 text-[0.88rem] text-muted-foreground">
          <span className={cn("transition-colors", !yearly && "font-bold text-foreground")}>
            Monthly
          </span>
          <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Toggle yearly billing" />
          <span className={cn("transition-colors", yearly && "font-bold text-foreground")}>
            Yearly{" "}
            <span className="ml-1.5 rounded-full bg-primary/18 px-1.75 py-0.5 text-[0.65rem] font-bold text-primary">
              Save $10
            </span>
          </span>
        </div>
      </ScrollReveal>

      <div className="mx-auto grid max-w-205 grid-cols-1 gap-12 sm:grid-cols-2">
        <ScrollReveal>
          <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7">
            <h3 className="mb-1 text-xl font-extrabold">Free</h3>
            <p className="mb-4.5 text-[0.85rem] text-muted-foreground">
              For getting your notes off the ground
            </p>
            <div className="mb-1.5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-[0.9rem] text-muted-foreground">/forever</span>
            </div>
            <ul className="my-5 flex flex-col gap-2.5 text-[0.88rem]">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-auto w-full">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative flex h-full flex-col rounded-xl border border-primary p-7 shadow-[0_0_0_1px_var(--color-primary)]">
            <span className="absolute -top-3.25 right-6 rounded-full bg-primary px-3 py-1.25 text-[0.68rem] font-extrabold tracking-wide text-primary-foreground uppercase shadow-lg">
              Most Popular
            </span>
            <Badge className="mb-3.5 w-fit animate-pulse bg-primary/22 text-primary">
              🎉 Limited Time: Pro is FREE
            </Badge>
            <h3 className="mb-1 text-xl font-extrabold">Pro</h3>
            <p className="mb-4.5 text-[0.85rem] text-muted-foreground">
              Unlimited notes, full AI superpowers
            </p>
            <div className="mb-1.5 flex items-baseline gap-1">
              <span className="text-lg text-muted-foreground line-through opacity-70">
                {yearly ? "$50" : "$5"}
              </span>
              <span className="text-4xl font-extrabold text-primary">$0</span>
              <span className="text-[0.9rem] text-muted-foreground">{yearly ? "/yr" : "/mo"}</span>
            </div>
            <p className="mb-1 text-[0.78rem] text-muted-foreground">
              Free during our launch period — lock it in now, no card required.
            </p>
            <ul className="my-5 flex flex-col gap-2.5 text-[0.88rem]">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-auto w-full">
              <Link href="/register">Claim Free Pro Access</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
