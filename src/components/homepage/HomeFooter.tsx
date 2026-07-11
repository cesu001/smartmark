interface FooterLink {
  label: string;
  href?: string;
}

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "About" }, { label: "Blog" }, { label: "Contact" }],
  },
  {
    title: "Legal",
    links: [{ label: "Privacy" }, { label: "Terms" }],
  },
];

export function HomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 pt-14">
      <div className="mx-auto grid max-w-285 grid-cols-2 gap-8 pb-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <a href="#top" className="inline-flex items-center gap-2.5 font-bold">
            <span className="flex size-7.5 items-center justify-center rounded-sm bg-primary font-extrabold text-primary-foreground">
              S
            </span>
            <span className="text-[1.1rem]">Smark</span>
          </a>
          <p className="mt-3 max-w-65 text-[0.85rem] text-muted-foreground">
            AI-powered markdown notes for people who think faster than they file.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="mb-3.5 text-[0.78rem] tracking-wide text-muted-foreground uppercase">
              {column.title}
            </h4>
            {column.links.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="mb-2.5 block text-[0.88rem] text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <span
                  key={link.label}
                  aria-disabled="true"
                  className="mb-2.5 block cursor-not-allowed text-[0.88rem] text-muted-foreground/50"
                >
                  {link.label}
                </span>
              )
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-[0.8rem] text-muted-foreground">
        <p>&copy; {year} Smark. All rights reserved.</p>
      </div>
    </footer>
  );
}
