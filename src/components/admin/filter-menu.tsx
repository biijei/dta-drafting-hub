"use client";

import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

type FilterMenuProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

export function FilterMenu({ value, options, onChange }: FilterMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = value === "All" ? "Status" : value;

  return (
    <div
      className="relative"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-w-[118px] items-center justify-between gap-3 rounded-xl border border-[#E6E8EE] bg-white px-4 py-2.5 text-sm text-[#4B5563] shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="size-4 text-[#9CA3AF]" />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[#EEF0F4] bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={clsx(
                  "flex w-full px-4 py-2 text-left text-sm",
                  value === option
                    ? "bg-[#F4F6FB] font-medium text-ink"
                    : "text-[#4B5563] hover:bg-[#F8F9FC]",
                )}
              >
                {option === "All" ? "All statuses" : option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
