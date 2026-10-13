import Image from "next/image";
import { whyChoose } from "@/content/home";

const cardIcons = [
  "/icons/bottom-left.svg",
  "/icons/bottom-middle.svg",
  "/icons/bottom-right.svg",
];

export function HomeWhy() {
  return (
    <section className="bg-[#F6F8FF] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[90rem] px-4">
        <div className="relative mx-auto max-w-3xl text-center">
          <Image
            src="/icons/top-left.svg"
            alt=""
            width={32}
            height={32}
            unoptimized
            className="absolute -top-2 left-0 hidden h-8 w-8 md:block"
          />
          <Image
            src="/icons/top-right.svg"
            alt=""
            width={32}
            height={32}
            unoptimized
            className="absolute -top-2 right-0 hidden h-8 w-8 md:block"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Why choose DTA Drafting Hub?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
            We combine professional expertise with a clear, digital-first process
            so you always know where your document stands.
          </p>
        </div>

        <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyChoose.map((item, index) => (
            <article key={item.title} className="w-full max-w-[284px] text-center">
              <Image
                src={cardIcons[index]}
                alt=""
                width={24}
                height={24}
                unoptimized
                className="mx-auto h-6 w-6"
              />
              <div className="mt-4 min-h-[100px] w-full rounded-[13px] bg-card px-[9px] py-[13px] text-left shadow-[0_8px_24px_rgba(13,27,75,0.05)]">
                <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-xs leading-4 text-muted">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
