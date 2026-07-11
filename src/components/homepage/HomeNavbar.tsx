"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

interface HomeNavbarProps {
  isLoggedIn: boolean;
}

export function HomeNavbar({ isLoggedIn }: HomeNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 border-b border-transparent backdrop-blur-md transition-colors duration-200",
        scrolled ? "border-border bg-background/90" : "bg-background/55"
      )}
    >
      <div className="mx-auto flex h-17 max-w-285 items-center justify-between gap-6 px-6">
        <Link
          href={isLoggedIn ? "/dashboard" : "#top"}
          className="inline-flex items-center gap-2.5 font-bold"
        >
          <span className="flex size-7.5 items-center justify-center rounded-sm bg-primary font-extrabold text-primary-foreground">
            S
          </span>
          <span className="text-[1.1rem]">Smark</span>
        </Link>

        <div className="flex items-center gap-9">
          <nav
            className={cn(
              "absolute top-17 right-0 left-0 flex flex-col gap-0 border-b border-border bg-background px-6 pt-2 pb-4 sm:static sm:flex-row sm:items-center sm:gap-7 sm:border-none sm:bg-transparent sm:p-0 sm:text-sm sm:text-muted-foreground",
              mobileOpen ? "flex" : "hidden sm:flex"
            )}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 hover:text-foreground sm:w-auto sm:py-0"
              >
                {link.label}
              </a>
            ))}
            {!isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 hover:text-foreground sm:hidden"
              >
                Sign In
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            {isLoggedIn ? (
              <Button asChild size="sm" className="h-11 px-4 sm:h-7 sm:px-2.5">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="h-11 px-4 sm:h-7 sm:px-2.5">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}

            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className="flex size-11 items-center justify-center rounded-sm border border-border sm:hidden"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
