import { FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DeliverableList } from "./deliverable-list";
import { ImportantNotice } from "./important-notice";
import { ServiceFaqList } from "./service-faq";
import { RequestButton } from "@/components/ui/request-button";
import {
  formatDollars,
  requestHref,
  serviceIllustrations,
  type Service,
} from "@/content/services";

export function ServiceDetail({ service }: { service: Service }) {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <section className="relative flex h-[250px] items-center overflow-hidden bg-gradient-to-r from-navy to-navy-bright">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-0 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-wash sm:h-[420px] sm:w-[420px]"
        />
        <div className="pointer-events-none absolute top-1/2 left-0 grid h-[160px] w-[80px] -translate-y-1/2 place-items-center sm:h-[250px] sm:w-[210px]">
          <Image
            src={serviceIllustrations[service.slug]}
            alt=""
            width={80}
            height={60}
            unoptimized
            className="h-10 w-auto sm:h-16"
          />
        </div>
        <div className="relative mx-auto flex w-full max-w-[90rem] flex-col gap-4 py-8 pr-4 pl-[6rem] sm:gap-6 sm:pl-[15.5rem] min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
          <div className="min-w-0">
            <h1 className="max-w-full font-heading text-[32px] font-medium leading-[0.97] tracking-normal text-white sm:text-[40px]">
              {service.title}
            </h1>
            <p className="mt-3 max-w-xl font-sans text-base font-normal leading-[1.26] tracking-normal text-white">
              {service.subtitle}
            </p>
          </div>
          <Link
            href="/service"
            className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-white px-6 py-2.5 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-white/90 sm:self-center"
          >
            Back
          </Link>
        </div>
      </section>

      <section className="pb-28 pt-10">
        <div className="mx-auto w-full max-w-[1040px] px-4">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.85fr)]">
          <div className="order-2 space-y-5 lg:order-1">
            <article className="rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
              <h2 className="text-base font-semibold text-ink">
                About this service
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
                {service.about.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
              <h2 className="text-base font-semibold text-ink">
                Who this service is for
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
                {service.audiences.map((audience) => (
                  <li key={audience}>{audience}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
              <h2 className="text-base font-semibold text-ink">
                What we can help with
              </h2>
              <div className="mt-4">
                <DeliverableList items={service.tags} />
              </div>
            </article>

            <article className="rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
              <h2 className="text-base font-semibold text-ink">
                What you need to provide
              </h2>
              <ul className="mt-4 space-y-3">
                {service.provide.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-muted"
                  >
                    <FileText
                      className="h-4 w-4 shrink-0 text-muted"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <ServiceFaqList
              items={service.faqs}
              defaultOpen={service.defaultFaqOpen}
            />
          </div>

          <aside className="order-1 lg:order-2">
            <div className="rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
              <dl className="space-y-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">Starting price</dt>
                  <dd className="font-semibold text-ink">
                    From {formatDollars(service.price)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">Turnaround</dt>
                  <dd className="text-right font-semibold text-ink">
                    {service.turnaround}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">Revisions</dt>
                  <dd className="font-semibold text-ink">{service.revisions}</dd>
                </div>
              </dl>
              <p className="mt-5 text-xs leading-5 text-muted">
                {service.pricingNote}
              </p>
              <RequestButton
                href={requestHref(service.slug)}
                label="Start request"
                showArrow
                className="mt-5 w-full"
              />
            </div>
            <div className="mt-4">
              <DeliverableList items={service.deliverables} />
            </div>
          </aside>
        </div>
        <div className="mt-6">
          <ImportantNotice />
        </div>
        </div>
      </section>
    </div>
  );
}
