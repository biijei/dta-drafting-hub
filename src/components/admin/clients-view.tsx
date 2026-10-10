"use client";

import { ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdmin } from "@/lib/admin-store";

const pageSize = 8;

export function ClientsView() {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const clients = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return data.clients.filter((client) =>
      needle.length === 0 ? true : client.name.toLowerCase().includes(needle),
    );
  }, [data.clients, query]);

  const pageCount = Math.max(1, Math.ceil(clients.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = clients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div>
      <h1 className="text-[32px] leading-none">Clients</h1>
      <label className="mt-5 flex items-center gap-3 rounded-xl border border-[#E6E8EE] bg-white px-4 py-3 text-[#9CA3AF] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <Search className="size-4 shrink-0" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name"
          aria-label="Search by name"
          className="w-full bg-transparent text-sm text-[#121826] outline-none placeholder:text-[#B0B6C3]"
        />
      </label>

      <section className="mt-4 overflow-hidden rounded-[20px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {visible.length === 0 ? (
          <p className="px-6 py-10 text-sm text-[#6B7280]">
            No clients match this search.
          </p>
        ) : (
          <ul>
            {visible.map((client) => (
              <li
                key={client.id}
                className="grid items-center gap-4 border-b border-[#F3F4F6] px-6 py-5 last:border-b-0 md:grid-cols-[1.3fr_0.8fr_repeat(4,0.7fr)_1fr]"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{client.name}</p>
                  <p className="break-all text-xs leading-snug text-[#9CA3AF]">
                    {client.email}
                  </p>
                </div>
                <Labeled label="Country" value={client.country} />
                <Labeled label="Total Requests" value={String(client.totalRequests)} />
                <Labeled label="Active" value={String(client.active)} />
                <Labeled label="Completed" value={String(client.completed)} />
                <Labeled label="Total Paid" value={String(client.totalPaid)} />
                <Labeled label="Last Activity" value={client.lastActivity} pre />
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav
        aria-label="Client pages"
        className="mt-6 flex justify-center"
      >
        <div className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <PagerButton
            label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronsLeft className="size-4" />
          </PagerButton>
          {Array.from({ length: pageCount }, (_, index) => {
            const number = index + 1;
            const active = number === currentPage;

            return (
              <button
                key={number}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setPage(number)}
                className={
                  active
                    ? "grid size-8 place-items-center rounded-full bg-[#0C1B4D] text-sm font-medium text-white"
                    : "grid size-8 place-items-center rounded-full text-sm text-[#6B7280]"
                }
              >
                {number}
              </button>
            );
          })}
          <PagerButton
            label="Next page"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronsRight className="size-4" />
          </PagerButton>
        </div>
      </nav>
    </div>
  );
}

function Labeled({
  label,
  value,
  pre = false,
}: {
  label: string;
  value: string;
  pre?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-[#9CA3AF]">{label}</p>
      <p
        className={
          pre
            ? "mt-1 whitespace-pre-line text-sm font-semibold leading-snug"
            : "mt-1 text-sm font-semibold"
        }
      >
        {value}
      </p>
    </div>
  );
}

function PagerButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full text-[#6B7280] disabled:text-[#D1D5DB]"
    >
      {children}
    </button>
  );
}
