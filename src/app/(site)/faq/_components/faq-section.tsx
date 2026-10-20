"use client";

import { clsx } from "clsx";
import { ChevronDown, CircleHelp } from "lucide-react";
import { useState } from "react";
import { RequestButton } from "@/components/ui/request-button";
import { faqFilters, faqItems, type FaqFilter } from "@/content/faq";

const navyPanel =
  "overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)] text-center";

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
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <div className={clsx("lookup-rise px-5 py-10 sm:px-10 sm:py-12", navyPanel)}>
        <span className="lookup-ring mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime text-navy">
          <CircleHelp className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold leading-none tracking-tight text-lime sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gold">
          Answers about services, process, files, payment, and tracking.
        </p>
      </div>

      <div
        role="toolbar"
        aria-label="Filter questions"
        className="mt-8 flex flex-wrap justify-center gap-2"
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
                  ? "bg-lime text-navy"
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
                    "h-4 w-4 shrink-0 transition-transform",
                    open ? "rotate-180 text-navy" : "text-muted",
                  )}
                />
              </button>
              {open ? (
                <p className="px-5 pb-4 text-sm leading-6 text-muted">{item.answer}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className={clsx("mt-10 px-6 py-10 sm:px-10 sm:py-12", navyPanel)}>
        <h2 className="text-2xl font-extrabold leading-none text-lime sm:text-3xl">
          Still have questions?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gold">
          Submit a request and we&apos;ll be in touch.
        </p>
        <div className="mt-6">
          <RequestButton className="bg-lime font-semibold text-navy hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime" />
        </div>
      </div>
    </section>
  );
}
