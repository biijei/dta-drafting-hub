import type { Metadata } from "next";
import { LegalDocument } from "@/components/layout/legal-document";
import { legalUpdated, privacyPolicy } from "@/content/legal";

export const metadata: Metadata = {
  title: privacyPolicy.title,
  description: privacyPolicy.description,
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title={privacyPolicy.title}
      description={privacyPolicy.description}
      kicker={`Updated ${legalUpdated}`}
      currentHref="/privacy"
      sections={privacyPolicy.sections}
    />
  );
}
