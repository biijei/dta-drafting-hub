"use client";

import { clsx } from "clsx";
import { Check, Copy, Mail, Phone, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode, type TransitionEvent } from "react";
import { createPortal } from "react-dom";

const CLOSE_MS = 360;

type ContactDockProps = {
  email: string;
  phone: string;
};

export function ContactDock({ email, phone }: ContactDockProps) {
  const titleId = useId();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | null>(null);
  const requestClose = useRef<() => void>(() => {});
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  function clearCloseTimer() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openDock() {
    clearCloseTimer();
    setRendered(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setVisible(true));
    });
  }

  function closeDock() {
    setVisible(false);
    clearCloseTimer();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeTimer.current = window.setTimeout(() => {
      setRendered(false);
    }, reduce ? 0 : CLOSE_MS);
  }

  requestClose.current = closeDock;

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    panelRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        requestClose.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = panelRef.current;
      const button = buttonRef.current;

      if (!panel || !button) {
        return;
      }

      const focusable = [
        ...panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
        button,
      ];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        return;
      }

      const index = focusable.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();

      if (index === -1) {
        (event.shiftKey ? last : first).focus();
        return;
      }

      const next = event.shiftKey ? focusable[index - 1] ?? last : focusable[index + 1] ?? first;
      next.focus();
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      buttonRef.current?.focus();
    };
  }, [rendered]);

  function onPanelTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "transform" || visible) {
      return;
    }

    clearCloseTimer();
    setRendered(false);
  }

  const phoneHref = phone.replace(/\s+/g, "");
  const hasDetails = Boolean(email || phone);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="group fixed right-6 bottom-6 z-[60] grid size-14 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy"
        aria-expanded={rendered}
        aria-controls={rendered ? panelId : undefined}
        aria-label={rendered ? "Close contact details" : "Contact us"}
        onClick={() => (visible ? closeDock() : openDock())}
      >
        {rendered ? null : (
          <span
            aria-hidden
            className="contact-dock-pulse pointer-events-none absolute inset-0 rounded-full bg-lime"
          />
        )}
        <span className="relative grid size-14 place-items-center rounded-full bg-lime text-navy shadow-[0_12px_32px_rgba(13,27,75,0.22)] ring-4 ring-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
          <Phone
            aria-hidden
            className={clsx(
              "contact-dock-icon absolute size-6",
              rendered ? "scale-75 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
            )}
            strokeWidth={2.25}
          />
          <X
            aria-hidden
            className={clsx(
              "contact-dock-icon absolute size-6",
              rendered ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-90 opacity-0",
            )}
            strokeWidth={2.25}
          />
        </span>
      </button>

      {rendered
        ? createPortal(
            <div className="fixed inset-0 z-50">
              <button
                type="button"
                aria-label="Close contact details"
                tabIndex={-1}
                className={clsx("contact-dock-backdrop absolute inset-0 bg-navy/40", visible && "is-open")}
                onClick={closeDock}
              />
              <aside
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onTransitionEnd={onPanelTransitionEnd}
                className={clsx(
                  "contact-dock-panel fixed inset-y-0 right-0 flex w-full flex-col overflow-hidden bg-white shadow-[-8px_0_40px_rgba(13,27,75,0.16)] outline-none sm:w-[22rem] sm:rounded-l-3xl",
                  visible && "is-open",
                )}
              >
                <header className="bg-navy px-6 pt-8 pb-7 text-white">
                  <p className="text-xs font-medium tracking-[0.18em] text-lime uppercase">
                    DTA Drafting Hub
                  </p>
                  <h2 id={titleId} className="mt-3 text-[1.75rem] leading-none text-white">
                    Contact us
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    These are the business contact details.
                  </p>
                </header>

                <div className="flex flex-1 flex-col gap-3 px-5 py-6 pb-24">
                  {email ? (
                    <ContactDetail
                      href={`mailto:${encodeURI(email)}`}
                      label="email"
                      value={email}
                      icon={<Mail aria-hidden className="size-5" strokeWidth={2.25} />}
                    />
                  ) : null}

                  {phone ? (
                    <ContactDetail
                      href={`tel:${phoneHref}`}
                      label="phone"
                      value={phone}
                      icon={<Phone aria-hidden className="size-5" strokeWidth={2.25} />}
                    />
                  ) : null}

                  {hasDetails ? null : (
                    <p className="rounded-2xl border border-line bg-navy-wash px-4 py-4 text-sm leading-6 text-muted">
                      Contact details are not available yet.
                    </p>
                  )}
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function ContactDetail({
  href,
  label,
  value,
  icon,
}: {
  href: string;
  label: "email" | "phone";
  value: string;
  icon: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
    };
  }, []);

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-navy-wash py-3 pr-3 pl-4 transition-colors hover:border-lime">
      <a href={href} className="flex min-w-0 flex-1 items-center gap-4 py-1">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lime text-navy">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-medium text-muted capitalize">{label}</span>
          <span className="mt-0.5 block text-sm font-medium break-all text-navy">{value}</span>
        </span>
      </a>
      <button
        type="button"
        onClick={() => void copyValue()}
        aria-label={label === "email" ? "Copy email" : "Copy phone"}
        className="grid size-9 shrink-0 place-items-center rounded-full text-navy transition-colors hover:bg-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        {copied ? (
          <Check aria-hidden className="size-4" strokeWidth={2.25} />
        ) : (
          <Copy aria-hidden className="size-4" strokeWidth={2.25} />
        )}
        <span className="sr-only" role="status">
          {copied ? "Copied" : ""}
        </span>
      </button>
    </div>
  );
}
