import type { Metadata } from "next";
import { LookupForm } from "./_components/lookup-form";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Track My Request",
  description: "Enter your Request ID to view the status of your request.",
};

export default function TrackRequestPage() {
  return (
    <>
      <PageHero
        title="Track My Request"
        description="Enter your Request ID to view the status of your request."
      />
      <section className="flex flex-1 justify-center px-4 py-16 sm:py-20">
        <LookupForm />
      </section>
    </>
  );
}
