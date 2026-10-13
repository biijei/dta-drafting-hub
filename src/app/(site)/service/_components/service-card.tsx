import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  formatDollars,
  requestHref,
  serviceIllustrations,
  type Service,
} from "@/content/services";

export function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  const row = Math.floor(index / 2);
  const column = index % 2;
  const pale = (row + column) % 2 === 0;

  return (
    <article className="@container relative h-auto w-full max-w-[680px] overflow-hidden rounded-[24px] border border-navy-soft bg-card">
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute top-[22px] left-[2px] h-[204px] w-[95px] rounded-r-[120px]",
          pale ? "bg-navy-wash" : "bg-lime",
        )}
      />
      <div className="pointer-events-none absolute top-[22px] left-[2px] grid h-[204px] w-[95px] place-items-center">
        <Image
          src={serviceIllustrations[service.slug]}
          alt=""
          width={80}
          height={60}
          unoptimized
          className="h-14 w-auto"
        />
      </div>

      <div className="relative flex h-full min-h-0 flex-col pt-[22px] pr-[15px] pb-[22px] pl-[96px] sm:pl-[110px] @xl:min-h-[248px] @xl:flex-row @xl:gap-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-sm text-ink">{service.turnaround}</p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">
            {service.title}
          </h2>
          <p className="mt-2 text-sm leading-5 text-muted">
            {service.cardDescription}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 @xl:mt-auto @xl:pt-3">
            {service.deliverables.map((item) => (
              <li
                key={item}
                className="text-xs text-ink underline underline-offset-2"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex shrink-0 flex-col items-end @xl:mt-0 @xl:w-[10.5rem]">
          <div className="text-right">
            <p className="text-xs text-muted">From</p>
            <p className="text-2xl font-semibold tracking-tight text-ink">
              {formatDollars(service.price)}
            </p>
          </div>
          <div className="mt-4 flex flex-col items-end gap-2 @xl:mt-auto">
            <Link
              href={`/service/${service.slug}`}
              className="text-sm font-medium text-ink hover:text-navy"
            >
              View details
            </Link>
            <Link
              href={requestHref(service.slug)}
              className="inline-flex items-center gap-2 rounded-full bg-navy py-1.5 pr-1.5 pl-4 text-xs font-medium text-white transition-colors hover:bg-navy/90"
            >
              Request service
              <span className="grid h-7 w-7 place-items-center rounded-full bg-lime text-navy">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
