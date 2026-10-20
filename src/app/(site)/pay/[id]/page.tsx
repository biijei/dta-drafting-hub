import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CreditCard } from "lucide-react";
import { PaymentChooser } from "@/components/payment/payment-chooser";
import { formatUsdCents } from "@/content/services";
import { isRequestUuid } from "@/lib/payable-request";
import { createServiceClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Pay",
  description: "Pay the quoted amount by card, PayPal, or another available method.",
};

type PayPageProps = {
  params: Promise<{ id: string }>;
};

const navyWash =
  "bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)]";

export default async function PayPage({ params }: PayPageProps) {
  await connection();
  const { id } = await params;
  const request = isRequestUuid(id) ? await loadPayRequest(id) : null;

  return (
    <section className="flex flex-1 justify-center px-4 py-10 sm:py-16">
      <article className={`w-full max-w-xl overflow-hidden rounded-[1.75rem] ${navyWash}`}>
        <div className="px-6 py-8 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gold">
                {request?.payable ? "Quoted amount" : "Payment"}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {request?.payable ? request.amount : "Payment link"}
              </h1>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime text-navy">
              <CreditCard className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
          </div>
          {request?.payable ? (
            <>
              <p className="mt-4 text-sm text-white">{request.title}</p>
              <p className="mt-1 text-sm text-gold">Request ID: {request.publicId}</p>
              <p className="mt-4 max-w-md text-sm leading-6 text-gold">
                Choose card, PayPal, or another method PayPal offers. A card payment does
                not need a PayPal account. Work starts after the payment is confirmed.
              </p>
              <div className="mt-6">
                <PaymentChooser requestId={request.id} />
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="max-w-md text-sm leading-6 text-gold">
                {request?.message ?? "This payment link is not available."}
              </p>
              <Link
                href="/track-request"
                className="mt-6 inline-flex rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                Track your request
              </Link>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

async function loadPayRequest(id: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("requests")
    .select("id, public_id, service_title, status, amount_cents")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return {
      payable: false as const,
      message: "This payment link is not available.",
    };
  }

  if (data.status === "Awaiting Payment" && data.amount_cents > 0) {
    return {
      payable: true as const,
      id: data.id,
      publicId: data.public_id,
      title: data.service_title,
      amount: formatUsdCents(data.amount_cents),
    };
  }

  if (data.status === "Pending Review") {
    return {
      payable: false as const,
      message: "The quote is not ready yet. We will email you when it is time to pay.",
    };
  }

  return {
    payable: false as const,
    message: "This request is already paid. You can follow it from your request workspace.",
  };
}
