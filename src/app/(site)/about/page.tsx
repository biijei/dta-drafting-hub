import type { Metadata } from "next";
import { Building2, Target } from "lucide-react";
import { ServiceMarquee } from "./_components/service-marquee";
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
      <section className="px-4 pt-10 sm:pt-14">
        <div className="lookup-rise mx-auto w-full max-w-[962px] overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)] px-5 py-10 text-center sm:px-10 sm:py-12">
          <span className="lookup-ring mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime text-navy">
            <Building2 className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold leading-none tracking-tight text-lime sm:text-4xl">
            About DTA Drafting Hub
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gold">
            Professional document services built around clarity, trust, and precision.
          </p>
        </div>
      </section>
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
        <div className="mx-auto w-full max-w-[962px] overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)] px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="text-2xl font-extrabold leading-none text-lime sm:text-3xl">
            Important Notice
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gold">
            DTA Drafting Hub provides document drafting and review services only.
            We do not provide legal advice. For legal advice specific to your
            circumstances, please consult a qualified legal professional licensed
            in the relevant jurisdiction.
          </p>
          <div className="mt-6">
            <RequestButton className="bg-lime font-semibold text-navy hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime" />
          </div>
        </div>
      </section>
    </>
  );
}
