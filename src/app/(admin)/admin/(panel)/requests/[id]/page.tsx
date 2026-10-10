import type { Metadata } from "next";
import { RequestDetail } from "@/components/admin/request-detail";

type AdminRequestPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Request",
  description: "Request details in the administration panel.",
};

export default async function AdminRequestPage({
  params,
}: AdminRequestPageProps) {
  const { id } = await params;

  return <RequestDetail key={id} id={id} />;
}
