import type { Metadata } from "next";
import { LookupForm } from "./_components/lookup-form";

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
    <section className="flex flex-1 justify-center px-4 py-10 sm:py-16">
      <LookupForm initialId={id ?? ""} />
    </section>
  );
}
