"use client";

import Link from "next/link";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LAST_UPDATED, PRIVACY_EN, PRIVACY_ZH } from "./privacy-content";

type Lang = "zh" | "en";

export function PrivacyPolicyContent() {
  const [lang, setLang] = useState<Lang>("zh");

  const title = lang === "zh" ? "隱私權政策" : "Privacy Policy";
  const updatedLabel = lang === "zh" ? "最後更新" : "Last updated";
  const homeLabel = lang === "zh" ? "返回首頁" : "Back to home";
  const body = lang === "zh" ? PRIVACY_ZH : PRIVACY_EN;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8 flex flex-col gap-6 border-b border-border pb-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5 font-bold">
              <span className="flex size-7.5 items-center justify-center rounded-sm bg-primary font-extrabold text-primary-foreground">
                S
              </span>
              <span className="text-[1.1rem]">Smark</span>
            </Link>

            <div
              role="group"
              aria-label={lang === "zh" ? "語言" : "Language"}
              className="inline-flex overflow-hidden rounded-md border border-border text-sm"
            >
              <button
                type="button"
                onClick={() => setLang("zh")}
                aria-pressed={lang === "zh"}
                className={
                  lang === "zh"
                    ? "bg-primary px-3 py-1.5 font-medium text-primary-foreground"
                    : "px-3 py-1.5 text-muted-foreground hover:text-foreground"
                }
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={
                  lang === "en"
                    ? "bg-primary px-3 py-1.5 font-medium text-primary-foreground"
                    : "border-l border-border px-3 py-1.5 text-muted-foreground hover:text-foreground"
                }
              >
                English
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {updatedLabel}: {LAST_UPDATED}
            </p>
          </div>
        </header>

        <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-table:block prose-table:overflow-x-auto">
          <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
        </article>

        <div className="mt-12 border-t border-border pt-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
