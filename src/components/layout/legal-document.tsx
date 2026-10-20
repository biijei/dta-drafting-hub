import { clsx } from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHero } from "@/components/ui/page-hero";
import type { LegalSection } from "@/content/legal";
import { footerLegal } from "@/content/navigation";

type LegalDocumentProps = {
  title: string;
  description: string;
  kicker: string;
  currentHref: string;
  sections?: LegalSection[];
  children?: ReactNode;
};

export function LegalDocument({
  title,
  description,
  kicker,
  currentHref,
  sections = [],
  children,
}: LegalDocumentProps) {
  const related = footerLegal.filter((item) => item.href !== currentHref);

  return (
    <>
      <PageHero variant="inset" title={title} description={description} />
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto grid w-full max-w-[90rem] items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8">
            <nav
              aria-label="Legal"
              className="rounded-[1.75rem] bg-navy px-6 py-7 text-white shadow-sm"
            >
              <p className="text-sm font-medium text-white/55">Legal</p>
              <ul className="mt-4 space-y-2.5">
                {footerLegal.map((item) => {
                  const active = item.href === currentHref;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={clsx(
                          "text-sm transition-colors hover:text-gold",
                          active ? "font-medium text-gold" : "text-white/90",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <article className="rounded-[1.75rem] bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-10">
            <p className="text-xs font-medium tracking-[0.14em] text-navy-mid uppercase">
              {kicker}
            </p>
            <div className="mt-8 max-w-3xl">
              {sections.length ? (
                <div className="space-y-10">
                  {sections.map((section, index) => (
                    <section key={section.title}>
                      <div className="flex items-baseline gap-4">
                        <span className="w-8 shrink-0 font-heading text-sm text-gold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-xl font-semibold text-ink">
                          {section.title}
                        </h2>
                      </div>
                      <div className="mt-3 space-y-4 text-sm leading-7 text-muted sm:pl-12">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : null}
              {children}
            </div>

            <div className="mt-12 border-t border-line pt-6">
              <p className="text-xs font-medium tracking-[0.14em] text-navy-mid uppercase">
                Also read
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {related.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-line px-4 py-2 text-sm text-navy transition-colors hover:border-gold hover:text-navy"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
