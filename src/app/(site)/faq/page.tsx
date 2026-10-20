import type { Metadata } from "next";
import { FaqSection } from "./_components/faq-section";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about services, process, files, payment, and tracking at DTA Drafting Hub.",
};

export default function FaqPage() {
  return <FaqSection />;
}
