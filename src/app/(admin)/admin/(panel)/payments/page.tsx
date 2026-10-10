import type { Metadata } from "next";
import { PaymentsView } from "@/components/admin/payments-view";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payments in the DTA Drafting Hub administration panel.",
};

export default function AdminPaymentsPage() {
  return <PaymentsView />;
}
