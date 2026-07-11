import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/homepage/ScrollReveal";

const CHECKLIST = [
  "Semantic search across your entire vault",
  "One-click AI summaries, copy or insert inline",
  "A chatbot grounded in your own notes — no hallucinated answers",
];

export function HomeAiSection() {
  return (
    <section className="border-y border-border bg-card px-6 py-22">
      <div className="mx-auto grid max-w-285 grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <ScrollReveal>
          <Badge variant="outline" className="mb-4.5 border-primary/40 px-3.5 py-1.5 text-primary">
            Pro Feature
          </Badge>
          <h2 className="mb-3.5 text-[clamp(1.6rem,3vw,2.1rem)] font-extrabold">
            Let AI do the busy work
          </h2>
          <p className="mb-5.5 text-muted-foreground">
            Every note you write gets automatically embedded and ready to be summarized or
            searched the moment you save it.
          </p>
          <ul className="mb-7 flex flex-col gap-3">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[0.92rem]">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Button asChild>
            <a href="#pricing">Unlock AI Features</a>
          </Button>
        </ScrollReveal>

        <ScrollReveal>
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-lg">
            <div className="flex items-center gap-1.5 border-b border-border px-3.5 py-2.5">
              <span className="size-2.25 rounded-full bg-[#ff5f56]" />
              <span className="size-2.25 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.25 rounded-full bg-[#27c93f]" />
              <span className="ml-2 font-mono text-[0.72rem] text-muted-foreground">
                postgres-indexing-notes.md
              </span>
            </div>
            <div className="max-h-55 overflow-hidden p-4">
              <pre className="font-mono text-[0.78rem] leading-relaxed whitespace-pre-wrap text-muted-foreground">
                <span className="font-bold text-primary"># PostgreSQL Performance Notes</span>
                {"\n\n"}
                <span className="font-bold text-foreground">## Indexing Strategies</span>
                {"\n"}- Use B-tree indexes for equality{"\n"}
                {"  "}and range queries{"\n"}- Consider partial indexes for{"\n"}
                {"  "}filtered queries{"\n"}- Watch for index bloat on{"\n"}
                {"  "}high-write tables{"\n\n"}
                <span className="font-bold text-foreground">## Query Planning</span>
                {"\n"}- Always check EXPLAIN ANALYZE{"\n"}
                {"  "}before shipping a slow query{"\n"}- Composite index column order{"\n"}
                {"  "}matters
              </pre>
            </div>
            <div className="border-t border-border bg-primary/7 p-4">
              <div className="mb-2.5 flex items-center gap-2 text-[0.8rem] font-bold text-primary">
                <Sparkles className="size-4" />
                AI Summary
              </div>
              <p className="mb-3.5 text-[0.82rem] text-muted-foreground">
                Notes on Postgres indexing: use B-tree for equality/range queries, partial indexes
                for filtered lookups, watch for bloat on write-heavy tables, and always confirm
                with EXPLAIN ANALYZE before shipping.
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="xs" type="button" disabled>
                  Copy
                </Button>
                <Button size="xs" type="button" disabled>
                  Insert
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
