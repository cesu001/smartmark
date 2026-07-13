"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { Send, Sparkles } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const ChatPanel = () => {
  const [input, setInput] = useState("");
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/dashboard/chat" }),
    onError: (err) => {
      toast.error(
        err.message || "Something went wrong talking to the assistant",
      );
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <ScrollArea className="flex-1 min-h-0 px-4">
        <div className="flex flex-col gap-3 py-2">
          {messages.length === 0 && (
            <p className="text-center text-sm italic text-muted-foreground">
              Ask me anything about your notes — I&apos;ll look for relevant
              ones to answer from.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "self-end whitespace-pre-wrap bg-primary text-primary-foreground"
                  : "self-start bg-muted text-foreground",
              )}
            >
              {message.parts.map((part, i) =>
                part.type !== "text" ? null : message.role === "user" ? (
                  <span key={`${message.id}-${i}`}>{part.text}</span>
                ) : (
                  <div
                    key={`${message.id}-${i}`}
                    className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 prose-blockquote:my-1 first:prose-p:mt-0 last:prose-p:mb-0"
                  >
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {part.text}
                    </Markdown>
                  </div>
                ),
              )}
            </div>
          ))}
          {status === "submitted" && (
            <div className="self-start flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Thinking…
            </div>
          )}
          <div ref={scrollEndRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your notes…"
          rows={1}
          className="h-8 min-h-0 resize-none py-1.5 field-sizing-fixed focus-visible:ring-2 focus-visible:ring-ring/30"
          disabled={isBusy}
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0"
          disabled={isBusy || !input.trim()}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;
