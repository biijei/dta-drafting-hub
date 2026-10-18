import type { Metadata } from "next";
import { LookupForm } from "./_components/lookup-form";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Track My Request",
  description:
    "Enter your Request ID and the email on the request to view its status.",
};

type TrackRequestPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function TrackRequestPage({ searchParams }: TrackRequestPageProps) {
  const { id } = await searchParams;

  return (
    <>
      <PageHero
        title="Track My Request"
        description="Enter your Request ID and the email on the request."
      />
      <section className="flex flex-1 justify-center px-4 py-16 sm:py-20">
        <LookupForm initialId={id ?? ""} />
      </section>
    </>
  );
}
