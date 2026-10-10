"use client";

import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { RequestButton } from "@/components/ui/request-button";
import { faqFilters, faqItems, type FaqFilter } from "@/content/faq";

export function FaqSection() {
  const [filter, setFilter] = useState<FaqFilter>("All");
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);

  const visibleItems = faqItems.filter(
    (item) => filter === "All" || item.category === filter,
  );

  function selectFilter(next: FaqFilter) {
    const nextItems = faqItems.filter(
      (item) => next === "All" || item.category === next,
    );
    setFilter(next);
    setOpenId(nextItems[0]?.id ?? null);
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <div
        role="toolbar"
        aria-label="Filter questions"
        className="flex flex-wrap justify-center gap-2"
      >
        {faqFilters.map((item) => {
          const selected = filter === item;

          return (
            <button
              key={item}
              type="button"
              aria-pressed={selected}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selected
                  ? "bg-navy text-white"
                  : "bg-card text-ink shadow-sm hover:bg-notice",
              )}
              onClick={() => selectFilter(item)}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {visibleItems.map((item) => {
          const open = openId === item.id;

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl bg-card shadow-sm"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span>{item.question}</span>
                <ChevronDown
                  aria-hidden
                  className={clsx(
                    "h-4 w-4 shrink-0 text-muted transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
              {open ? (
                <p className="px-5 pb-4 text-sm leading-6 text-muted">
                  {item.answer}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl bg-notice px-6 py-10 text-center">
        <h2 className="text-base font-semibold text-ink">Still have questions?</h2>
        <p className="mt-2 text-sm text-muted">
          Submit a request and we&apos;ll be in touch.
        </p>
        <div className="mt-5">
          <RequestButton />
        </div>
      </div>
    </section>
  );
}
