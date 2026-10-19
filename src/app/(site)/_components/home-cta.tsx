import { RequestButton } from "@/components/ui/request-button";

export function HomeCta() {
  return (
    <section className="px-4 pb-16 sm:pb-20">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)] px-6 py-10 text-center sm:px-10 sm:py-12">
        <h2 className="text-2xl font-extrabold leading-none text-lime sm:text-3xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gold">
          Submit a request today and receive a quote within one business day.
        </p>
        <div className="mt-6">
          <RequestButton className="bg-lime font-semibold text-navy hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime" />
        </div>
      </div>
    </section>
  );
}
