import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDollars, serviceIllustrations, services } from "@/content/services";

const cardLayouts = [
  { tone: "pale" },
  { tone: "lime" },
  { tone: "pale" },
  { tone: "lime" },
  { tone: "pale" },
  { tone: "lime" },
] as const;

export function HomeServices() {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:py-16">
      <div className="text-center">
        <h2 className="font-sans! text-[32px] font-medium! leading-[1.26] tracking-normal text-ink">
          Our Services
        </h2>
        <p className="mt-2 font-sans text-base font-normal leading-[1.26] tracking-normal text-[#656565]">
          Expert document support across a range of professional needs.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1380px] grid-cols-1 justify-items-center gap-[15px] min-[1400px]:grid-cols-3">
        {services.map((service, index) => {
          const layout = cardLayouts[index];

          return (
            <article
              key={service.slug}
              className="relative h-[284px] w-full max-w-[450px] overflow-hidden rounded-[24px] border border-line bg-card"
            >
              <div
                aria-hidden
                className={clsx(
                  "pointer-events-none absolute top-[22px] h-[240px] w-[117px] left-[2px] rounded-r-[120px]",
                  layout.tone === "lime" ? "bg-lime" : "bg-[#F6F8FF]",
                )}
              />
              <div className="pointer-events-none absolute top-[22px] left-[2px] grid h-[240px] w-[117px] place-items-center">
                <Image
                  src={serviceIllustrations[service.slug]}
                  alt=""
                  width={80}
                  height={60}
                  unoptimized
                  className="h-16 w-auto"
                />
              </div>
              <div
                className={clsx(
                  "relative flex h-full flex-col pt-[22px] pb-[22px] pr-[15px] pl-[132px]",
                )}
              >
                <p className="text-sm text-ink">
                  From {formatDollars(service.price)}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {service.subtitle}
                </p>
                <p className="mt-4 text-sm text-ink">{service.turnaround}</p>
                <Link
                  href={`/service/${service.slug}`}
                  className="mt-auto inline-flex items-center gap-3 text-sm font-medium text-navy hover:text-ink"
                >
                  View service
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white">
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
