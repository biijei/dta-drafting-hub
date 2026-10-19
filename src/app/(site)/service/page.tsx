import type { Metadata } from "next";
import { Briefcase } from "lucide-react";
import { ServiceCard } from "./_components/service-card";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Professional document support across a range of personal and business needs.",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <section className="px-4 pt-10 sm:pt-14">
        <div className="lookup-rise mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)] px-5 py-10 text-center sm:px-10 sm:py-12">
          <span className="lookup-ring mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime text-navy">
            <Briefcase className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold leading-none tracking-tight text-lime sm:text-4xl">
            Our Services
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gold">
            Professional document support across a range of personal and business needs.
          </p>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-[90rem] grid-cols-1 justify-items-center gap-[15px] px-4 py-12 xl:grid-cols-2">
        {services.map((service, index) => (
          <ServiceCard key={service.slug} service={service} index={index} />
        ))}
      </section>
    </div>
  );
}
