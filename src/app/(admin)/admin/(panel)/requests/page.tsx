import type { Metadata } from "next";
import { RequestsView } from "@/components/admin/requests-view";

export const metadata: Metadata = {
  title: "Requests",
  description: "Review document requests in the administration panel.",
};

export default function AdminRequestsPage() {
  return <RequestsView />;
}
