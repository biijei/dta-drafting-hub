"use client";

import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { homeFaqs } from "@/content/home";

export function HomeFaq() {
  const [openId, setOpenId] = useState<string | null>(homeFaqs[0]?.id ?? null);

  return (
    <section className="bg-surface px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="text-center font-sans! text-[32px] font-medium! leading-[1.26] tracking-normal text-ink">
          Frequently Asked Questions
        </h2>

        <div className="mt-10 flex flex-col gap-3">
          {homeFaqs.map((item) => {
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
      </div>
    </section>
  );
}
