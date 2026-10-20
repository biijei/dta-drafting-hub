import type { Metadata } from "next";
import { LegalDocument } from "@/components/layout/legal-document";
import { loadPublicDisclaimer } from "@/lib/mail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "The current disclaimer published by DTA Drafting Hub LLC for its document drafting and review services.",
};

function DisclaimerNotice({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="border-l-2 border-gold pl-6 sm:pl-8">
      <div className="space-y-5 text-lg leading-8 text-ink">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export default async function DisclaimerPage() {
  let disclaimer = "";
  let unavailable = false;

  try {
    disclaimer = await loadPublicDisclaimer();
  } catch (error) {
    console.error(error);
    unavailable = true;
  }

  return (
    <LegalDocument
      title="Disclaimer"
      description="The notice DTA Drafting Hub LLC publishes with its document drafting and review services."
      kicker="Current notice"
      currentHref="/disclaimer"
    >
      {disclaimer ? (
        <DisclaimerNotice text={disclaimer} />
      ) : (
        <p className="text-sm leading-7 text-muted">
          {unavailable
            ? "The disclaimer could not be loaded right now."
            : "The disclaimer has not been published yet."}
        </p>
      )}
    </LegalDocument>
  );
}
