import type { Metadata } from "next";
import { ClientsView } from "@/components/admin/clients-view";

export const metadata: Metadata = {
  title: "Clients",
  description: "Clients in the DTA Drafting Hub administration panel.",
};

export default function AdminClientsPage() {
  return <ClientsView />;
}
