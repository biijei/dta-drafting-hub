import type { Metadata } from "next";
import { Route } from "lucide-react";
import { ProcessSteps } from "./_components/process-steps";
import { RequestButton } from "@/components/ui/request-button";

export const metadata: Metadata = {
  title: "Our Process",
  description: "A clear, structured workflow from request to final document.",
};

export default function ProcessPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="px-4 pt-10 sm:pt-14">
        <div className="lookup-rise mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)] px-5 py-10 text-center sm:px-10 sm:py-12">
          <span className="lookup-ring mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime text-navy">
            <Route className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold leading-none tracking-tight text-lime sm:text-4xl">
            Our Process
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gold">
            A clear, structured workflow from request to final document.
          </p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <ProcessSteps />
        <div className="mt-10 flex justify-center">
          <RequestButton />
        </div>
      </section>
    </div>
  );
}
