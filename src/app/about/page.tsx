import type { Metadata } from "next";
import { Target } from "lucide-react";
import { ServiceMarquee } from "./_components/service-marquee";
import { PageHero } from "@/components/ui/page-hero";
import { RequestButton } from "@/components/ui/request-button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Professional document services built around clarity, trust, and precision.",
};

const values = [
  {
    title: "Professional",
    description:
      "Experienced team with backgrounds across legal drafting, contracts, immigration, and business documentation.",
  },
  {
    title: "Transparent",
    description:
      "Every step of your request is visible. No guessing, no chasing just a clear process from submission to final document.",
  },
  {
    title: "Secure",
    description:
      "Your documents and personal information are handled with strict confidentiality and never shared without your consent.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        variant="inset"
        title="About DTA Drafting Hub"
        description="Professional document services built around clarity, trust, and precision."
      />
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[962px]">
        <article className="rounded-2xl bg-card px-6 py-8 shadow-sm sm:px-8">
          <h2 className="text-xl font-semibold text-ink">Who we are</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
            <p>
              DTA Drafting Hub LLC is a professional drafting and
              document-support company that helps people turn their ideas,
              information, and requirements into clear, well-written,
              professional documents.
            </p>
            <p>
              The business is built for individuals, professionals, businesses,
              and organizations that know what they need to say, but may need
              help putting it together the right way. Whether the document is
              legal-related, business-focused, or simply important enough to
              require a polished presentation, DTA Drafting Hub helps make sure
              it is clear, organized, accurate, and professionally written.
            </p>
          </div>
        </article>

        <p className="mt-8 flex items-start gap-3 text-sm leading-6 text-muted">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-muted">
            <Target className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          </span>
          <span>
            The goal is simple: make drafting easier for clients and give them
            confidence that their documents are being handled with care and
            attention to detail.
          </span>
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-2xl bg-card px-6 py-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-ink">{value.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {value.description}
              </p>
            </article>
          ))}
        </div>
        </div>
      </section>

      <ServiceMarquee />

      <section className="px-4 py-12">
        <div className="mx-auto flex w-full max-w-[962px] flex-col items-center">
        <div className="w-full rounded-2xl bg-notice px-6 py-5 text-sm leading-6 text-muted">
          <p>
            <span className="font-semibold text-ink">Important Notice: </span>
            DTA Drafting Hub provides document drafting and review services
            only. We do not provide legal advice. For legal advice specific to
            your circumstances, please consult a qualified legal professional
            licensed in the relevant jurisdiction.
          </p>
        </div>
        <div className="mt-8">
          <RequestButton />
        </div>
        </div>
      </section>
    </>
  );
}
