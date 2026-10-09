import { RequestButton } from "@/components/ui/request-button";

export function HomeCta() {
  return (
    <section className="bg-cream px-4 py-16 text-center sm:py-20">
      <h2 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Ready to get started?
      </h2>
      <p className="mt-3 text-sm text-muted sm:text-base">
        Submit a request today and receive a quote within one business day.
      </p>
      <div className="mt-8">
        <RequestButton />
      </div>
    </section>
  );
}
