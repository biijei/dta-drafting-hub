import type { TrackedRequest } from "@/content/track-request";

type PaymentPanelProps = {
  request: TrackedRequest;
};

export function PaymentPanel({ request }: PaymentPanelProps) {
  if (request.status === "Pending Review") {
    return (
      <section>
        <h2 className="text-base font-semibold text-ink">Payment</h2>
        <article className="mt-4 max-w-3xl rounded-2xl bg-card px-5 py-5 shadow-sm sm:px-6">
          <p className="text-sm leading-6 text-muted">
            DTA is reviewing your files. A PayPal link for the quoted amount
            will appear here and in your email.
          </p>
        </article>
      </section>
    );
  }

  if (request.status === "Awaiting Payment") {
    return (
      <section>
        <h2 className="text-base font-semibold text-ink">Payment</h2>
        <article className="mt-4 max-w-3xl rounded-2xl bg-card px-5 py-5 shadow-sm sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-ink">Quoted amount</h3>
            <span className="text-sm font-semibold text-ink">{request.payment.amount}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            Pay with PayPal. Work starts after PayPal confirms the payment.
          </p>
          {request.paymentUrl ? (
            <a
              href={request.paymentUrl}
              className="mt-5 inline-flex rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/90"
            >
              Pay with PayPal
            </a>
          ) : (
            <p className="mt-4 text-sm text-muted">The payment link is not ready yet.</p>
          )}
        </article>
      </section>
    );
  }

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
