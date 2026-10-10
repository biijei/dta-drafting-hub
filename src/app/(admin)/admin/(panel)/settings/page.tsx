import type { Metadata } from "next";
import { SettingsView } from "@/components/admin/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Administration settings for DTA Drafting Hub.",
};

export default function AdminSettingsPage() {
  return <SettingsView />;
}
