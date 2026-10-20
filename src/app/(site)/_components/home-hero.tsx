import { BadgeCheck, FileSearch, PenLine, Scale } from "lucide-react";
import { Great_Vibes } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { heroCopy } from "@/content/home";
import { requestServiceHref } from "@/content/navigation";

const script = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

const experts = [
  { label: "Review", icon: FileSearch, background: "#97BAF9" },
  { label: "Drafting", icon: PenLine, background: "#FCEF71" },
  { label: "Expertise", icon: Scale, background: "#8BABF9" },
  { label: "Approval", icon: BadgeCheck, background: "#8CD1F7" },
];

export function HomeHero() {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 pt-6 sm:pt-8">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)] px-5 py-14 text-center sm:px-10 sm:py-16">
        <Image
          src="/icons/hero-book-icon.svg"
          alt=""
          width={48}
          height={48}
          unoptimized
          className="absolute top-8 left-8 hidden h-12 w-12 md:block"
        />

        <h1 className="text-[1.45rem] font-extrabold leading-[0.97] tracking-normal sm:text-4xl md:text-5xl lg:text-[64px]">
          <span className="block text-lime">Professional Document</span>
          <span className="mt-1 block text-white">
            Drafting & <span className="text-violet">Review,</span>
            <Image
              src="/icons/hero-star-icon.svg"
              alt=""
              width={40}
              height={40}
              unoptimized
              className="ml-3 inline-block h-8 w-8 -translate-y-2 sm:h-10 sm:w-10"
            />
          </span>
          <span className="mt-1 block text-lime">Made Simple.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl font-heading text-base font-normal leading-[1.47] tracking-normal text-gold">
          {heroCopy.description}
        </p>

        <div className="relative mx-auto mt-8 grid max-w-3xl grid-cols-[1fr_auto_1fr] items-center">
          <Image
            src="/icons/hero-copy-icon.svg"
            alt=""
            width={48}
            height={48}
            unoptimized
            className="mr-10 hidden h-12 w-12 justify-self-end md:mr-28 md:block lg:mr-40"
          />
          <Link
            href={requestServiceHref}
            className="col-start-2 inline-flex rounded-full bg-lime px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            Request a service
          </Link>
        </div>

        <div className="relative mx-auto mt-8 flex max-w-3xl flex-col items-center">
          <div className="flex -space-x-3">
            {experts.map(({ label, icon: Icon, background }) => (
              <span
                key={label}
                className="grid h-12 w-12 place-items-center rounded-full text-navy"
                style={{ backgroundColor: background }}
              >
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
            ))}
          </div>
          <p className={`${script.className} mt-3 flex flex-wrap justify-center gap-4 leading-none text-white`}>
            <span className="block text-3xl">Review</span>
            <span className="-mt-1 block text-xl">by experts</span>
          </p>
          <Image
            src="/icons/hero-writing-note.svg"
            alt=""
            width={48}
            height={48}
            unoptimized
            className="absolute top-0 right-[8%] hidden h-12 w-12 md:block lg:right-[18%]"
          />
        </div>
      </div>
    </section>
  );
}
