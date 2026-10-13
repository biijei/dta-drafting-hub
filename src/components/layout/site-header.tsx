"use client";

import { clsx } from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RequestButton } from "@/components/ui/request-button";
import { isActivePath, mainNav } from "@/content/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="relative z-30 border-b border-line bg-card">
      <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-4 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/icons/logo.svg"
            alt="DTA logo"
            width={42}
            height={37}
            priority
            unoptimized
            className="h-9 w-auto"
          />
          <span className="min-w-0 truncate text-sm font-semibold text-navy sm:text-base">
            DTA Drafting Hub LLC
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium",
                  active ? "bg-navy text-white" : "text-ink hover:text-navy",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <RequestButton className="text-lime" />
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
