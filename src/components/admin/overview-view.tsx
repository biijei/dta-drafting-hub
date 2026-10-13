"use client";

import { clsx } from "clsx";
import Image from "next/image";
import Link from "next/link";
import { overviewStats } from "@/content/admin";
import { useAdmin } from "@/lib/admin-store";
import { StatusPill } from "./status-pill";

const card =
  "rounded-[20px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

function CardIcon({
  src,
  background,
  shape,
  className,
}: {
  src: string;
  background: string;
  shape: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "grid size-9 place-items-center",
        shape,
        className,
      )}
      style={{ backgroundColor: background }}
    >
      <Image
        src={src}
        alt=""
        width={18}
        height={18}
        unoptimized
        className="h-[18px] w-auto"
      />
    </span>
  );
}

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
      <div className="mb-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl leading-none sm:text-[32px]">Overview</h1>
        <Link
          href="/admin/requests"
          className="inline-flex rounded-full bg-[#0D1B4B] px-5 py-2.5 text-sm font-medium text-[#D3B48A]"
        >
          View request
        </Link>
      </div>

      <div className="grid gap-4">
        <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className={`${card} relative overflow-visible p-5`}>
              <CardIcon
                src="/icons/admin/total-request.svg"
                background="#0D1B4B"
                shape="rounded-lg"
                className="absolute right-0 top-5 -translate-y-1/2"
              />
              <p className="text-sm text-[#6B7280]">Total Requests</p>
              <p className="mt-5 text-[34px] font-semibold leading-none">
                {overviewStats.totalRequests}
              </p>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                {overviewStats.totalChange}
              </p>
            </article>
            <article className={`${card} relative overflow-visible p-5`}>
              <CardIcon
                src="/icons/admin/new-request.svg"
                background="#D7DCED"
                shape="rounded-lg"
                className="absolute right-0 top-5 -translate-y-1/2"
              />
              <p className="text-sm text-[#6B7280]">New Requests</p>
              <p className="mt-5 text-[34px] font-semibold leading-none">
                {overviewStats.newRequests}
              </p>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                {overviewStats.newCaption}
              </p>
            </article>
            <article className={`${card} relative overflow-visible p-5`}>
              <CardIcon
                src="/icons/admin/in-progress.svg"
                background="#FFF8EE"
                shape="rounded-lg"
                className="absolute right-0 top-5 -translate-y-1/2"
              />
              <p className="text-sm text-[#6B7280]">In Progress</p>
              <p className="mt-5 text-[34px] font-semibold leading-none">
                {overviewStats.inProgress}
              </p>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                {overviewStats.inProgressCaption}
              </p>
            </article>
          </div>

          <article className="relative flex h-full flex-col overflow-visible rounded-[20px] bg-[#0C1B4D] p-5 text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <p className="text-sm text-[#D3B48A]">Revenue (AUD)</p>
            <p className="mt-auto pt-8 text-[34px] font-semibold leading-none text-white">
              {overviewStats.revenue}
            </p>
            <p className="mt-2 text-sm text-[#D3B48A]">
              {overviewStats.revenueCaption}
            </p>
            <CardIcon
              src="/icons/admin/revenue-icon.svg"
              background="#404C73"
              shape="rounded-lg"
              className="absolute -bottom-0 -right-0"
            />
          </article>
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <article className={`${card} flex items-center justify-between px-6 py-5`}>
              <p className="text-sm text-[#6B7280]">Awaiting Client</p>
              <div className="text-center">
                <p className="text-[34px] font-semibold leading-none">
                  {overviewStats.awaitingClient}
                </p>
                <p className="mt-2 text-sm text-[#9CA3AF]">
                  {overviewStats.awaitingCaption}
                </p>
              </div>
            </article>
            <article className={`${card} flex items-center justify-between px-6 py-5`}>
              <p className="text-sm text-[#6B7280]">Completed</p>
              <div className="text-center">
                <p className="text-[34px] font-semibold leading-none">
                  {overviewStats.completed}
                </p>
                <p className="mt-2 text-sm text-[#9CA3AF]">
                  {overviewStats.completedCaption}
                </p>
              </div>
            </article>
          </div>

          <section className={`${card} px-6 py-5`}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base">Recent Requests</h2>
              <Link href="/admin/requests" className="text-sm font-medium text-[#0D1B4B]">
                View all
              </Link>
            </div>
            <ul>
              {recent.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-col gap-3 border-b border-[#F1F2F6] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-[#9CA3AF]">{request.displayId}</p>
                    <p className="mt-0.5 text-[15px] font-semibold">
                      {request.clientName}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">{request.service}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <StatusPill status={request.status} />
                    <OpenLink href={`/admin/requests/${request.id}`} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

          <div className="grid content-start gap-4">
          <section className={`${card} px-5 py-5`}>
            <h2 className="text-base">Pending Actions</h2>
            <ul className="mt-3 space-y-3">
              {pending.flatMap((request) =>
                Array.from({ length: request.pendingRepeats }, (_, index) => (
                  <li
                    key={`${request.id}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#EEF0F4] px-3 py-3"
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
              <Link href="/admin/payments" className="text-sm font-medium text-[#0D1B4B]">
                View all
              </Link>
            </div>
            <ul className="space-y-3">
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#EEF0F4] px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{payment.clientName}</p>
                    <p className="break-all text-xs text-[#9CA3AF]">
                      {payment.transactionId}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-[#121826]">
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
    </div>
  );
}
