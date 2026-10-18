"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** When false, Escape, the backdrop, and the close button leave the dialog open. */
  dismissible?: boolean;
  /** Admin chrome stays the default. Public pages use the site card treatment. */
  tone?: "admin" | "site";
};

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  returnFocusRef,
  dismissible = true,
  tone = "admin",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  const site = tone === "site";

  useEffect(() => {
    onCloseRef.current = onClose;
    dismissibleRef.current = dismissible;
  }, [onClose, dismissible]);

  function requestClose() {
    if (!dismissibleRef.current) {
      return;
    }
    onCloseRef.current();
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const returnFocus = returnFocusRef?.current ?? null;
    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    panelRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!dismissibleRef.current) {
          event.preventDefault();
          return;
        }
        onCloseRef.current();
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      (returnFocus ?? previouslyFocused)?.focus();
    };
  }, [open, returnFocusRef]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={`${site ? "" : "admin-app "}modal-fade fixed inset-0 z-50`}>
      <div
        className={`absolute inset-0 z-0 backdrop-blur-sm ${site ? "bg-navy/40" : "bg-[#D9D9D9]/60"}`}
        onClick={requestClose}
      />
      <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center overflow-visible p-8">
        <div className="pointer-events-auto relative w-full max-w-lg overflow-visible">
          <button
            type="button"
            aria-label="Close"
            disabled={!dismissible}
            onClick={(event) => {
              event.stopPropagation();
              requestClose();
            }}
            className={`absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-shadow hover:shadow-lg disabled:opacity-60 ${site ? "text-ink" : "text-[#121826]"}`}
          >
            <X size={18} aria-hidden strokeWidth={2} />
          </button>
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={`overflow-visible rounded-2xl p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] outline-none sm:p-8 ${site ? "border border-line bg-card" : "bg-white"}`}
          >
            {icon ? <div className="mb-4">{icon}</div> : null}
            <h2 id={titleId} className={site ? "text-lg font-semibold text-ink" : "text-base text-[#121826]"}>
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className={site ? "mt-2 text-sm leading-relaxed text-muted" : "mt-1 text-sm text-[#6B7280]"}>
                {description}
              </p>
            ) : null}
            <div className="mt-5">{children}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
