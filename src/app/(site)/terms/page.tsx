import type { Metadata } from "next";
import { LegalDocument } from "@/components/layout/legal-document";
import { legalUpdated, termsOfService } from "@/content/legal";

export const metadata: Metadata = {
  title: termsOfService.title,
  description: termsOfService.description,
};

export default function TermsPage() {
  return (
    <LegalDocument
      title={termsOfService.title}
      description={termsOfService.description}
      kicker={`Updated ${legalUpdated}`}
      currentHref="/terms"
      sections={termsOfService.sections}
    />
  );
}
