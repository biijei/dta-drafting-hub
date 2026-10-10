import type { Metadata } from "next";
import { RequestWizard } from "./_components/request-wizard";

export const metadata: Metadata = {
  title: "Request a service",
  description: "Submit a document request to DTA Drafting Hub.",
};

type RequestPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RequestPage({ searchParams }: RequestPageProps) {
  const params = await searchParams;
  const service = params.service;
  const initialSlug = typeof service === "string" ? service : "";

  return <RequestWizard initialSlug={initialSlug} />;
}
