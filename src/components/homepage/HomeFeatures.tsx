import { FolderOpen, MessageCircle, PencilLine, Search, Sparkles, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/homepage/ScrollReveal";

const FEATURES = [
  {
    icon: PencilLine,
    title: "Real-Time Markdown Editor",
    description:
      "Write in Markdown and watch it render instantly, WYSIWYG-style — no separate preview pane to switch between.",
    pro: false,
  },
  {
    icon: FolderOpen,
    title: "Collections",
    description:
      "Group related notes into collections that match the way you actually think and work, not a rigid folder tree.",
    pro: false,
  },
  {
    icon: Tag,
    title: "Tags",
    description:
      "Label notes freely and filter by topic in a click — flexible, cross-cutting organization alongside your collections.",
    pro: false,
  },
  {
    icon: Search,
    title: "AI Semantic Search",
    description:
      "Find the right note by meaning, not just keywords — vector embeddings surface what you meant, not just what you typed.",
    pro: true,
  },
  {
    icon: Sparkles,
    title: "AI Summary",
    description:
      "Get an instant, AI-generated summary of any note, however long — with one-click copy or insert back into the note.",
    pro: true,
  },
  {
    icon: MessageCircle,
    title: "AI Chatbot",
    description:
      "Ask questions about your notes in plain language and get grounded answers pulled straight from your own knowledge base.",
    pro: true,
  },
];

export function HomeFeatures() {
  return (
    <section id="features" className="scroll-mt-20 px-6 py-22">
      <ScrollReveal className="mx-auto mb-12 max-w-155 text-center">
        <span className="mb-2.5 inline-block text-xs font-bold tracking-wider text-primary uppercase">
          Features
        </span>
        <h2 className="mb-3 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-tight">
          Everything your notes need, nothing they don&apos;t
        </h2>
        <p className="text-muted-foreground">
          A focused editor with just enough AI to keep you organized automatically.
        </p>
      </ScrollReveal>

      <div className="mx-auto grid max-w-285 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <ScrollReveal key={feature.title}>
            <Card className="h-full transition-[border-color,transform] duration-200 hover:-translate-y-0.75 hover:border-primary/50">
              <CardHeader>
                <div className="mb-3 flex size-10.5 items-center justify-center rounded-md bg-primary/14 text-primary">
                  <feature.icon className="size-5.5" />
                </div>
                <CardTitle className="flex items-center gap-2 text-base">
                  {feature.title}
                  {feature.pro && (
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      Pro
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
