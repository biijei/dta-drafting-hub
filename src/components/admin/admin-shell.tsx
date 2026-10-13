"use client";

import { clsx } from "clsx";
import {
  ChevronDown,
  CreditCard,
  LayoutGrid,
  Menu,
  Settings,
  SquarePen,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, readSession } from "@/lib/admin-store";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/requests", label: "Request", icon: SquarePen, exact: false },
  { href: "/admin/clients", label: "Clients", icon: Users, exact: false },
  { href: "/admin/payments", label: "Payment", icon: CreditCard, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="mt-5 flex flex-col gap-1.5 px-4">
      {navItems.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={clsx(
              "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-white text-[#121826]"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-white/20 px-5 pb-5 pt-6">
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white">
        <Image
          src="/icons/logo.svg"
          alt=""
          width={30}
          height={26}
          unoptimized
          className="h-6 w-auto"
          style={{ width: "auto", height: "1.5rem" }}
        />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[13px] font-semibold text-white">
          DTA Drafting Hub LLC
        </p>
        <p className="text-xs text-white/65">Admin</p>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [name, setName] = useState("Micah Ehioze");

  useEffect(() => {
    const session = readSession();
    if (session?.name) {
      setName(session.name);
    }
  }, []);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    const close = () => setAccountOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [accountOpen]);

  function signOut() {
    clearSession();
    router.replace("/admin/login");
  }

  return (
    <div className="admin-app flex min-h-full flex-1 bg-[#F3F4F6] text-[#121826]">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-[#0C1B4D] lg:flex">
        <Brand />
        <SidebarNav />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[248px] flex-col bg-[#0C1B4D]">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-4 text-white/80"
            >
              <X className="size-5" />
            </button>
            <Brand />
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] items-center justify-between border-b border-[#EEF0F4] bg-white px-4 sm:px-7">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-[#0C1B4D] lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <div
            className="relative ml-auto"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-[#F4F6FB] py-1 pl-1 pr-3"
            >
              <span className="grid size-8 place-items-center rounded-full bg-[#3B82F6] text-white">
                <UserRound className="size-4" />
              </span>
              <span className="hidden max-w-[9rem] truncate text-sm font-medium text-[#1F2937] sm:inline-block">
                {name}
              </span>
              <ChevronDown className="size-4 text-[#6B7280]" />
            </button>
            {accountOpen ? (
              <div
                role="menu"
                className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-[#EEF0F4] bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={signOut}
                  className="flex w-full px-4 py-2 text-left text-sm text-[#374151] hover:bg-[#F8F9FC]"
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <div className="flex-1 px-4 py-6 sm:px-7 sm:py-7">{children}</div>
      </div>
    </div>
  );
}
