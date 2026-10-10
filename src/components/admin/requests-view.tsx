"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { requestStatuses } from "@/content/admin";
import { useAdmin } from "@/lib/admin-store";
import { FilterMenu } from "./filter-menu";
import { StatusPill } from "./status-pill";

export function RequestsView() {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const requests = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtering = needle.length > 0 || status !== "All";

    return data.requests.filter((request) => {
      if (!filtering && !request.featuredOnOverview) {
        return false;
      }

      const matchesQuery =
        needle.length === 0 ||
        request.displayId.toLowerCase().includes(needle);
      const matchesStatus = status === "All" || request.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [data.requests, query, status]);

  return (
    <div>
      <h1 className="text-[32px] leading-none">Request</h1>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#E6E8EE] bg-white px-4 py-3 text-[#9CA3AF] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <Search className="size-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search request ID"
            aria-label="Search request ID"
            className="w-full bg-transparent text-sm text-[#121826] outline-none placeholder:text-[#B0B6C3]"
          />
        </label>
        <FilterMenu
          value={status}
          options={["All", ...requestStatuses]}
          onChange={setStatus}
        />
      </div>

      <section className="mt-4 overflow-hidden rounded-[20px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {requests.length === 0 ? (
          <p className="px-6 py-10 text-sm text-[#6B7280]">
            No requests match this filter.
          </p>
        ) : (
          <ul>
            {requests.map((request) => (
              <li
                key={request.id}
                className="grid items-center gap-4 border-b border-[#F3F4F6] px-6 py-5 last:border-b-0 lg:grid-cols-[1.15fr_1fr_1.15fr_0.9fr_auto]"
              >
                <div>
                  <p className="text-xs text-[#9CA3AF]">Client</p>
                  <p className="mt-1 font-semibold">{request.clientName}</p>
                  <p className="text-xs text-[#9CA3AF]">{request.clientEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Request ID</p>
                  <p className="mt-1 font-semibold">{request.displayId}</p>
                  <StatusPill status={request.paymentStatus} />
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Service</p>
                  <p className="mt-1 font-semibold">{request.service}</p>
                  <p className="text-xs text-[#9CA3AF]">{request.submittedAt}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Assigned</p>
                  <p className="mt-1 font-semibold">{request.assignee ?? "-"}</p>
                </div>
                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <StatusPill status={request.status} />
                  <Link
                    href={`/admin/requests/${request.id}`}
                    className="inline-flex rounded-full bg-[#F3F4F6] px-5 py-1.5 text-sm font-medium text-[#4B5563]"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
