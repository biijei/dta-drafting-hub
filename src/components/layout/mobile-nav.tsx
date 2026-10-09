"use client";

import { clsx } from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RequestButton } from "@/components/ui/request-button";
import { isActivePath, mainNav } from "@/content/navigation";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open ? (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-line bg-card px-6 py-4 shadow-sm"
        >
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "block rounded-full px-4 py-2 text-sm font-medium",
                      active ? "bg-navy text-white" : "text-ink",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <RequestButton className="mt-4 w-full text-lime" />
        </div>
      ) : null}
    </div>
  );
}
