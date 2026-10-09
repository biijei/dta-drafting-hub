import type { Metadata } from "next";
import { ProcessSteps } from "./_components/process-steps";
import { PageHero } from "@/components/ui/page-hero";
import { RequestButton } from "@/components/ui/request-button";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "A clear, structured workflow from request to final document.",
};

export default function ProcessPage() {
  return (
    <>
      <PageHero
        variant="inset"
        title="Our Process"
        description="A clear, structured workflow from request to final document."
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
        <ProcessSteps />
        <div className="mt-8 flex justify-center">
          <RequestButton />
        </div>
      </section>
    </>
  );
}
