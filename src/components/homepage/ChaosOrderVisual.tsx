"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Code, FileCode, FileText, Terminal } from "lucide-react";
import { SiCss, SiGithub, SiHtml5, SiJavascript } from "react-icons/si";
import { cn } from "@/lib/utils";

interface ChaosIconDef {
  key: string;
  colorClassName: string;
  stacked?: boolean;
  content: React.ReactNode;
}

const CHAOS_ICONS: ChaosIconDef[] = [
  {
    key: "js",
    colorClassName: "bg-[#f7df1e] text-black",
    content: <SiJavascript className="size-5" />,
  },
  {
    key: "html",
    colorClassName: "bg-[#e34f26] text-white",
    content: <SiHtml5 className="size-5" />,
  },
  {
    key: "css",
    colorClassName: "bg-[#2965f1] text-white",
    content: <SiCss className="size-5" />,
  },
  {
    key: "github",
    colorClassName: "bg-[#171515] text-white",
    content: <SiGithub className="size-4" />,
  },
  {
    key: "vscode",
    colorClassName: "bg-[#007acc] text-white",
    content: <Code className="size-5" />,
  },
  {
    key: "terminal",
    colorClassName: "border border-border bg-background font-mono text-primary",
    content: <Terminal className="size-4" />,
  },
  {
    key: "txt",
    colorClassName: "border border-border bg-muted text-foreground",
    stacked: true,
    content: (
      <>
        <FileText className="size-4" />
        <span className="text-[0.55rem]">.txt</span>
      </>
    ),
  },
  {
    key: "md",
    colorClassName: "border border-border bg-muted text-foreground",
    stacked: true,
    content: (
      <>
        <FileCode className="size-4" />
        <span className="text-[0.55rem] text-primary">.md</span>
      </>
    ),
  },
];

interface IconState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  maxX: number;
  maxY: number;
  phase: number;
  placed: boolean;
}

const REPEL_RADIUS = 95;
const REPEL_STRENGTH = 0.55;
const MAX_SPEED = 1.3;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function ChaosBox() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const field = fieldRef.current;
    const icons = iconRefs.current.filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (!field || !icons.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const state: IconState[] = icons.map(() => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      w: 0,
      h: 0,
      maxX: 0,
      maxY: 0,
      phase: Math.random() * Math.PI * 2,
      placed: false,
    }));
    const mouse = { x: -9999, y: -9999, active: false };

    function layout() {
      if (!field) return;
      const rect = field.getBoundingClientRect();
      icons.forEach((icon, i) => {
        const s = state[i];
        const w = icon.offsetWidth || 50;
        const h = icon.offsetHeight || 30;
        s.w = w;
        s.h = h;
        s.maxX = Math.max(rect.width - w, 0);
        s.maxY = Math.max(rect.height - h, 0);
        if (!s.placed) {
          s.x = rand(0, s.maxX);
          s.y = rand(0, s.maxY);
          const speed = rand(0.25, 0.55);
          const angle = rand(0, Math.PI * 2);
          s.vx = Math.cos(angle) * speed;
          s.vy = Math.sin(angle) * speed;
          s.placed = true;
        }
      });
    }

    layout();
    window.addEventListener("resize", layout);

    function onMouseMove(e: MouseEvent) {
      if (!field) return;
      const rect = field.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onMouseLeave() {
      mouse.active = false;
    }
    field.addEventListener("mousemove", onMouseMove);
    field.addEventListener("mouseleave", onMouseLeave);

    let frameId: number;
    function tick() {
      icons.forEach((icon, i) => {
        const s = state[i];

        s.x += s.vx;
        s.y += s.vy;

        if (s.x <= 0) {
          s.x = 0;
          s.vx = Math.abs(s.vx);
        } else if (s.x >= s.maxX) {
          s.x = s.maxX;
          s.vx = -Math.abs(s.vx);
        }

        if (s.y <= 0) {
          s.y = 0;
          s.vy = Math.abs(s.vy);
        } else if (s.y >= s.maxY) {
          s.y = s.maxY;
          s.vy = -Math.abs(s.vy);
        }

        if (mouse.active) {
          const cx = s.x + s.w / 2;
          const cy = s.y + s.h / 2;
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
            s.vx += (dx / dist) * force;
            s.vy += (dy / dist) * force;
          }
        }

        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (speed > MAX_SPEED) {
          s.vx = (s.vx / speed) * MAX_SPEED;
          s.vy = (s.vy / speed) * MAX_SPEED;
        }

        s.phase += 0.02;
        const wobble = Math.sin(s.phase * 1.4 + i) * 6;
        const scale = 1 + Math.sin(s.phase + i) * 0.05;

        icon.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${wobble.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
      });

      frameId = requestAnimationFrame(tick);
    }

    if (reducedMotion) {
      icons.forEach((icon, i) => {
        const s = state[i];
        icon.style.transform = `translate(${s.x}px, ${s.y}px)`;
      });
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("resize", layout);
      field.removeEventListener("mousemove", onMouseMove);
      field.removeEventListener("mouseleave", onMouseLeave);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
      <p className="mb-3 text-center text-[0.8rem] text-muted-foreground">
        Your notes today...
      </p>
      <div
        ref={fieldRef}
        aria-hidden
        className="relative h-70 overflow-hidden rounded-md border border-dashed border-border"
      >
        {CHAOS_ICONS.map((icon, i) => (
          <div
            key={icon.key}
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            className={cn(
              "absolute top-0 left-0 flex size-11 items-center justify-center rounded-sm text-[0.68rem] font-extrabold shadow-lg will-change-transform",
              icon.stacked ? "flex-col gap-0.5" : "gap-1",
              icon.colorClassName,
            )}
          >
            {icon.content}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniDashboardPreview() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
      <p className="mb-3 text-center text-[0.8rem] text-muted-foreground">
        ...with Smark
      </p>
      <div
        aria-hidden
        className="grid h-70 grid-cols-[92px_1fr] overflow-hidden rounded-md border border-border bg-background"
      >
        <div className="flex flex-col gap-2 border-r border-border p-2.5">
          <div className="mb-1.5 size-5 rounded-[5px] bg-primary" />
          <div className="h-2 rounded bg-primary/55" />
          <div className="h-2 rounded bg-muted" />
          <div className="h-2 rounded bg-muted" />
          <div className="h-1.5" />
          <div className="h-2 w-[70%] rounded bg-muted opacity-70" />
          <div className="h-2 w-[70%] rounded bg-muted opacity-70" />
          <div className="h-2 w-[70%] rounded bg-muted opacity-70" />
        </div>
        <div className="p-3">
          <div className="mb-3 h-4 w-[70%] rounded-md border border-border" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 rounded-sm border border-border bg-card p-2"
              >
                <div className="h-1.5 w-[70%] rounded bg-foreground/70" />
                <div className="h-1 rounded bg-muted" />
                <div className="h-1 w-[60%] rounded bg-muted" />
                <div className="mt-1 h-2.5 w-8.5 rounded-full bg-primary/30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChaosOrderVisual() {
  return (
    <div className="mx-auto grid max-w-270 grid-cols-1 items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
      <ChaosBox />
      <div
        aria-hidden
        className="animate-pulse justify-self-center text-primary max-md:rotate-90"
      >
        <ArrowRight className="size-8" />
      </div>
      <MiniDashboardPreview />
    </div>
  );
}
