import type { Metadata } from "next";
import { ServiceCard } from "./_components/service-card";
import { PageHero } from "@/components/ui/page-hero";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Professional document support across a range of personal and business needs.",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <PageHero
        variant="inset"
        title="Our Services"
        description="Professional document support across a range of personal and business needs."
      />
      <section className="mx-auto grid w-full max-w-[90rem] grid-cols-1 justify-items-center gap-[15px] px-4 py-12 min-[1400px]:grid-cols-2">
        {services.map((service, index) => (
          <ServiceCard key={service.slug} service={service} index={index} />
        ))}
      </section>
    </div>
  );
}
