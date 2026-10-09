"use client";

import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ServiceFaq } from "@/content/services";

type ServiceFaqListProps = {
  items: ServiceFaq[];
  defaultOpen: boolean;
};

export function ServiceFaqList({ items, defaultOpen }: ServiceFaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultOpen ? 0 : null,
  );

  return (
    <section className="rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
      <h2 className="text-base font-semibold text-ink">
        Frequently Asked Questions
      </h2>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => {
          const open = openIndex === index;

          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-xl border border-line"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : index)}
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
                <p className="px-4 pb-4 text-sm leading-6 text-muted">
                  {item.answer}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
