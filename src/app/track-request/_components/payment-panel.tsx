import type { TrackedRequest } from "@/content/track-request";

type PaymentPanelProps = {
  request: TrackedRequest;
};

export function PaymentPanel({ request }: PaymentPanelProps) {
  const rows = [
    { label: "Transaction ID", value: request.payment.transactionId },
    { label: "Amount", value: request.payment.amount },
    { label: "Method", value: request.payment.method },
    { label: "Date", value: request.payment.date },
  ];

  return (
    <section>
      <h2 className="text-base font-semibold text-ink">Payment</h2>
      <article className="mt-4 max-w-3xl rounded-2xl bg-card px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-ink">Payment Receipt</h3>
          <span className="rounded-full bg-navy-soft px-3 py-1 text-xs font-medium text-navy">
            {request.payment.status}
          </span>
        </div>
        <dl className="mt-4 divide-y divide-transparent">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-6 py-3 text-sm"
            >
              <dt className="text-muted">{row.label}</dt>
              <dd className="text-right font-medium text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  );
}
