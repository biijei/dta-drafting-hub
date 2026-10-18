"use client";

import { clsx } from "clsx";
import { Check, ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type DropdownProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: readonly DropdownOption[];
  placeholder?: string;
  ariaLabel?: string;
  labelledBy?: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
  className?: string;
  buttonLabel?: string;
  menuAlign?: "start" | "end";
  compact?: boolean;
};

function nextEnabled(
  options: readonly DropdownOption[],
  start: number,
  direction: 1 | -1,
) {
  if (options.length === 0) {
    return -1;
  }

  let index = start;

  for (let step = 0; step < options.length; step += 1) {
    index = (index + direction + options.length) % options.length;

    if (!options[index]?.disabled) {
      return index;
    }
  }

  return start;
}

function firstEnabled(options: readonly DropdownOption[], fromEnd = false) {
  const ordered = fromEnd ? [...options].reverse() : options;
  const match = ordered.findIndex((option) => !option.disabled);

  if (match < 0) {
    return -1;
  }

  return fromEnd ? options.length - 1 - match : match;
}

export function Dropdown({
  id,
  name,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  ariaLabel,
  labelledBy,
  ariaInvalid,
  disabled = false,
  className,
  buttonLabel,
  menuAlign = "start",
  compact = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const listId = `${buttonId}-list`;
  const valueId = `${buttonId}-value`;
  const selected = options.find((option) => option.value === value);
  const shown = buttonLabel ?? selected?.label ?? placeholder ?? "Select";
  const isPlaceholder = !buttonLabel && !selected;

  useEffect(() => {
    if (!open) {
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();

    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUp(spaceBelow < 240 && spaceAbove > spaceBelow);
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown, true);
    }, 0);
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) {
      return;
    }

    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openMenu(preferred = options.findIndex((option) => option.value === value)) {
    const start =
      preferred >= 0 && !options[preferred]?.disabled
        ? preferred
        : firstEnabled(options);
    setActiveIndex(start);
    setOpen(true);
  }

  function commit(option: DropdownOption) {
    if (option.disabled) {
      return;
    }

    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!open) {
        openMenu();
        return;
      }

      setActiveIndex((index) =>
        nextEnabled(options, index, event.key === "ArrowDown" ? 1 : -1),
      );
      return;
    }

    if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(firstEnabled(options));
      return;
    }

    if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(firstEnabled(options, true));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!open) {
        openMenu();
        return;
      }

      const option = options[activeIndex];

      if (option) {
        commit(option);
      }
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={clsx("relative", compact ? "w-max max-w-full" : "w-full", className)}
    >
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        name={name}
        disabled={disabled}
        role="combobox"
        aria-autocomplete="none"
        aria-label={labelledBy ? undefined : ariaLabel ? `${ariaLabel}, ${shown}` : undefined}
        aria-labelledby={labelledBy ? `${labelledBy} ${valueId}` : undefined}
        aria-invalid={ariaInvalid || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
        onBlur={onBlur}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) {
            return;
          }

          event.preventDefault();
        }}
        onClick={() => {
          if (disabled) {
            return;
          }

          if (open) {
            setOpen(false);
            return;
          }

          openMenu();
        }}
        onKeyDown={onTriggerKeyDown}
        className={clsx(
          "inline-flex items-center justify-between gap-3 rounded-xl border border-line bg-card text-left text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none focus-visible:border-navy disabled:cursor-not-allowed disabled:opacity-60",
          compact ? "min-w-[118px] px-4 py-2.5" : "w-full px-4 py-3",
          isPlaceholder ? "text-muted" : "text-ink",
        )}
      >
        <span id={valueId} className="min-w-0 truncate">
          {shown}
        </span>
        <ChevronDown
          className={clsx(
            "size-4 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={labelledBy ? undefined : ariaLabel}
          aria-labelledby={labelledBy}
          className={clsx(
            "absolute z-30 max-h-60 overflow-y-auto rounded-xl border border-line bg-card py-1 shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
            menuAlign === "end" ? "right-0" : "left-0",
            openUp ? "bottom-full mb-1" : "top-full mt-1",
            compact ? "w-52" : "w-full",
          )}
        >
          {options.map((option, index) => {
            const selectedOption = option.value === value;
            const active = index === activeIndex;

            return (
              <li key={`${option.value}-${option.label}`}>
                <button
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  id={`${listId}-option-${index}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={selectedOption}
                  aria-disabled={option.disabled || undefined}
                  disabled={option.disabled}
                  onPointerDown={(event) => {
                    if (event.button !== 0) {
                      return;
                    }

                    event.preventDefault();
                  }}
                  onClick={() => commit(option)}
                  className={clsx(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm",
                    option.disabled
                      ? "cursor-not-allowed text-muted/50"
                      : "text-ink hover:bg-navy-wash",
                    active && !option.disabled && "bg-navy-wash",
                    selectedOption && !option.disabled && "font-medium",
                  )}
                >
                  <Check
                    className={clsx(
                      "size-4 shrink-0 text-navy",
                      selectedOption ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
