"use client";

import { CreditCard } from "lucide-react";
import { useMemo, useState } from "react";
import { paymentStatuses } from "@/content/admin";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdmin } from "@/lib/admin-store";
import { FilterMenu } from "./filter-menu";
import { StatusPill } from "./status-pill";

const card =
  "rounded-[20px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

export function PaymentsView() {
  const { data } = useAdmin();
  const [status, setStatus] = useState("All");

  const payments = useMemo(
    () =>
      data.payments.filter(
        (payment) => status === "All" || payment.status === status,
      ),
    [data.payments, status],
  );
  const paymentStats = data.paymentSummary;

  return (
    <div>
      <h1 className="text-2xl leading-none sm:text-[32px]">Payments</h1>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className={card}>
          <p className="text-sm text-[#6B7280]">Total Collected</p>
          <p className="mt-4 text-[32px] font-semibold leading-none">
            {paymentStats.totalCollected}
          </p>
          <p className="mt-2 text-sm text-[#9CA3AF]">{paymentStats.totalCaption}</p>
        </article>
        <article className={card}>
          <p className="text-sm text-[#6B7280]">Successful</p>
          <p className="mt-4 text-[32px] font-semibold leading-none">
            {paymentStats.successful}
          </p>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            {paymentStats.successfulCaption}
          </p>
        </article>
        <article className={card}>
          <p className="text-sm text-[#6B7280]">Pending</p>
          <p className="mt-4 text-[32px] font-semibold leading-none">
            {paymentStats.pending}
          </p>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            {paymentStats.pendingCaption}
          </p>
        </article>
        <article className={card}>
          <p className="text-sm text-[#6B7280]">Refunded</p>
          <p className="mt-4 text-[32px] font-semibold leading-none">
            {paymentStats.refunded}
          </p>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            {paymentStats.refundedCaption}
          </p>
        </article>
      </div>

      <div className="mt-4">
        <FilterMenu
          value={status}
          options={["All", ...paymentStatuses]}
          onChange={setStatus}
        />
      </div>

      <section className="mt-4 overflow-hidden rounded-[20px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments match this filter"
            description="Try another status."
          />
        ) : (
          <ul>
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="grid items-start gap-4 border-b border-[#F3F4F6] px-4 py-5 last:border-b-0 sm:px-6 md:grid-cols-2 xl:items-center xl:grid-cols-[1fr_1fr_1fr_auto_1fr]"
              >
                <div>
                  <p className="text-xs text-[#9CA3AF]">Transaction ID</p>
                  <p className="mt-1 font-semibold">{payment.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Client</p>
                  <p className="mt-1 font-semibold">{payment.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Method</p>
                  <p className="mt-1 font-semibold">{payment.method}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#34A35A]">{payment.amount}</p>
                  <div className="mt-1">
                    <StatusPill status={payment.status} />
                  </div>
                </div>
                <div className="md:col-span-2 xl:col-span-1 xl:text-right">
                  <p className="text-xs text-[#9CA3AF]">Date</p>
                  <p className="mt-1 text-sm font-semibold">{payment.date}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
