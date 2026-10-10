"use client";

import { CircleCheck, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { overviewStats } from "@/content/admin";
import { useAdmin } from "@/lib/admin-store";
import { StatusPill } from "./status-pill";

const card =
  "rounded-[20px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

function OpenLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full bg-[#F3F4F6] px-4 py-1.5 text-xs font-medium text-[#4B5563]"
    >
      Open
    </Link>
  );
}

export function OverviewView() {
  const { data } = useAdmin();
  const recent = data.requests.filter((request) => request.featuredOnOverview);
  const pending = data.requests.filter((request) => request.pendingRepeats > 0);
  const payments = data.payments.filter((payment) => payment.onOverview);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-[32px] leading-none">Overview</h1>
        <Link
          href="/admin/requests"
          className="inline-flex rounded-full bg-[#0C1B4D] px-5 py-2.5 text-sm font-medium text-white"
        >
          View request
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <article className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <p className="text-sm text-[#6B7280]">Total Requests</p>
                <span className="grid size-8 place-items-center rounded-md bg-[#1B2A6B] text-[11px] font-semibold tracking-tight text-white">
                  [+]
                </span>
              </div>
              <p className="mt-5 text-[34px] font-semibold leading-none">
                {overviewStats.totalRequests}
              </p>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                {overviewStats.totalChange}
              </p>
            </article>
            <article className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <p className="text-sm text-[#6B7280]">New Requests</p>
                <span className="grid size-8 place-items-center rounded-lg bg-[#EEF1F8] text-[#8B95B2]">
                  <ImageIcon className="size-4" />
                </span>
              </div>
              <p className="mt-5 text-[34px] font-semibold leading-none">
                {overviewStats.newRequests}
              </p>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                {overviewStats.newCaption}
              </p>
            </article>
            <article className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <p className="text-sm text-[#6B7280]">In Progress</p>
                <CircleCheck className="size-6 text-[#C5CAD6]" strokeWidth={1.5} />
              </div>
              <p className="mt-5 text-[34px] font-semibold leading-none">
                {overviewStats.inProgress}
              </p>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                {overviewStats.inProgressCaption}
              </p>
            </article>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className={`${card} px-6 py-5`}>
              <p className="text-sm text-[#6B7280]">Awaiting Client</p>
              <p className="mt-3 text-center text-[34px] font-semibold leading-none">
                {overviewStats.awaitingClient}
              </p>
              <p className="mt-2 text-center text-sm text-[#9CA3AF]">
                {overviewStats.awaitingCaption}
              </p>
            </article>
            <article className={`${card} px-6 py-5`}>
              <p className="text-sm text-[#6B7280]">Completed</p>
              <p className="mt-3 text-center text-[34px] font-semibold leading-none">
                {overviewStats.completed}
              </p>
              <p className="mt-2 text-center text-sm text-[#9CA3AF]">
                {overviewStats.completedCaption}
              </p>
            </article>
          </div>

          <section className={`${card} px-6 py-5`}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base">Recent Requests</h2>
              <Link href="/admin/requests" className="text-sm font-medium text-[#3B5BDB]">
                View all
              </Link>
            </div>
            <ul>
              {recent.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-4 border-b border-[#F1F2F6] py-4 last:border-b-0"
                >
                  <div>
                    <p className="text-xs text-[#9CA3AF]">{request.displayId}</p>
                    <p className="mt-0.5 text-[15px] font-semibold">
                      {request.clientName}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">{request.service}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusPill status={request.status} />
                    <OpenLink href={`/admin/requests/${request.id}`} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid gap-4">
          <article className="relative overflow-hidden rounded-[20px] bg-[#0C1B4D] p-5 text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <p className="text-sm text-white/70">Revenue (AUD)</p>
            <p className="mt-8 text-[34px] font-semibold leading-none">
              {overviewStats.revenue}
            </p>
            <p className="mt-2 text-sm text-white/55">
              {overviewStats.revenueCaption}
            </p>
            <span className="absolute bottom-4 right-4 grid size-8 place-items-center rounded-md bg-white/10 text-white/80">
              <ImageIcon className="size-4" />
            </span>
          </article>

          <section className={`${card} px-5 py-5`}>
            <h2 className="text-base">Pending Actions</h2>
            <ul className="mt-3">
              {pending.flatMap((request) =>
                Array.from({ length: request.pendingRepeats }, (_, index) => (
                  <li
                    key={`${request.id}-${index}`}
                    className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[#9CA3AF]">{request.displayId}</p>
                      <p className="text-sm font-medium text-[#E25555]">
                        {request.pendingLabel}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">
                        {request.pendingSubtitle}
                      </p>
                    </div>
                    <Link
                      href={`/admin/requests/${request.id}`}
                      className="inline-flex shrink-0 rounded-full border border-[#EEF0F4] bg-[#F8F9FB] px-4 py-1.5 text-xs font-medium text-[#4B5563]"
                    >
                      View
                    </Link>
                  </li>
                )),
              )}
            </ul>
          </section>

          <section className={`${card} px-5 py-5`}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base">Recent Payments</h2>
              <Link href="/admin/payments" className="text-sm font-medium text-[#3B5BDB]">
                View all
              </Link>
            </div>
            <ul>
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{payment.clientName}</p>
                    <p className="break-all text-xs text-[#9CA3AF]">
                      {payment.transactionId}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-[#34A35A]">
                      {payment.amount}
                    </p>
                    <StatusPill status={payment.status} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
