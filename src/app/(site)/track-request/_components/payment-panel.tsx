import { CreditCard, FileSearch, Mail, PenLine, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TrackedRequest } from "@/content/track-request";
import { PaymentChooser } from "@/components/payment/payment-chooser";

type PaymentPanelProps = {
  request: TrackedRequest;
  onPaid?: () => void;
};

const navyWash =
  "bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)]";

const waitSteps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: FileSearch,
    title: "Review",
    text: "DTA is reviewing your files.",
  },
  {
    icon: Mail,
    title: "Payment link",
    text: "A link for the quoted amount appears here and in your email.",
  },
  {
    icon: PenLine,
    title: "Work starts",
    text: "Work starts after the payment is confirmed.",
  },
];

export function PaymentPanel({ request, onPaid }: PaymentPanelProps) {
  if (request.status === "Pending Review") {
    return (
      <section>
        <h2 className="text-base font-semibold text-ink">Payment</h2>
        <article
          className={`mt-4 max-w-3xl overflow-hidden rounded-[1.75rem] px-5 py-10 text-center sm:px-10 sm:py-12 ${navyWash}`}
        >
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime text-navy ring-4 ring-violet/50">
            <FileSearch className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className="mt-6 text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
            <span className="block text-lime">DTA is reviewing</span>
            <span className="mt-2 block text-white">your files</span>
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gold">
            A payment link for the quoted amount will appear here and in your email.
          </p>
          <ol className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            {waitSteps.map((step, index) => {
              const Icon = step.icon;
              const current = index === 0;

              return (
                <li
                  key={step.title}
                  aria-current={current ? "step" : undefined}
                  className={
                    current
                      ? "h-full rounded-2xl bg-card px-4 py-4"
                      : "h-full rounded-2xl bg-white/10 px-4 py-4"
                  }
                >
                  <span
                    className={
                      current
                        ? "grid h-9 w-9 place-items-center rounded-full bg-lime text-navy"
                        : "grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lime"
                    }
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <p
                    className={
                      current
                        ? "mt-3 text-sm font-semibold text-navy"
                        : "mt-3 text-sm font-semibold text-white"
                    }
                  >
                    {step.title}
                  </p>
                  <p
                    className={
                      current
                        ? "mt-1 text-sm leading-5 text-muted"
                        : "mt-1 text-sm leading-5 text-gold"
                    }
                  >
                    {step.text}
                  </p>
                </li>
              );
            })}
          </ol>
        </article>
      </section>
    );
  }

  if (request.status === "Awaiting Payment") {
    return (
      <section>
        <h2 className="text-base font-semibold text-ink">Payment</h2>
        <article className="mt-4 max-w-3xl overflow-hidden rounded-[1.75rem] bg-card shadow-sm">
          <div className={`px-6 py-8 sm:px-8 ${navyWash}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gold">Quoted amount</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {request.payment.amount}
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime text-navy">
                <CreditCard className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-gold">
              Choose card, PayPal, or another method PayPal offers. A card payment does not
              need a PayPal account. Work starts after the payment is confirmed.
            </p>
            <div className="mt-6">
              <PaymentChooser onPaid={onPaid} />
            </div>
          </div>
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
      <article className="mt-4 max-w-3xl overflow-hidden rounded-[1.75rem] bg-card shadow-sm">
        <div className={`flex items-center justify-between gap-4 px-6 py-6 sm:px-8 ${navyWash}`}>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime text-navy">
              <Receipt className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="text-lg font-semibold text-white">Payment Receipt</h3>
          </div>
          <span className="rounded-full bg-lime px-3 py-1 text-xs font-semibold text-navy">
            {request.payment.status}
          </span>
        </div>
        <dl className="px-5 py-2 sm:px-6">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-6 border-b border-line py-3.5 text-sm last:border-b-0"
            >
              <dt className="text-muted">{row.label}</dt>
              <dd className="text-right font-semibold text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  );
}
