import type { Metadata } from "next";
import { FaqSection } from "./_components/faq-section";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about services, process, files, payment, and tracking at DTA Drafting Hub.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero variant="inset" title="Frequently Asked Questions" />
      <FaqSection />
    </>
  );
}
