import type { Metadata } from "next";
import { OverviewView } from "@/components/admin/overview-view";

export const metadata: Metadata = {
  title: "Overview",
  description: "DTA Drafting Hub administration overview.",
};

export default function AdminOverviewPage() {
  return <OverviewView />;
}
