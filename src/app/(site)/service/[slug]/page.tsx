import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "../_components/service-detail";
import { getService, services } from "@/content/services";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  return {
    title: service?.title ?? "Service",
    description: service?.subtitle,
  };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  return <ServiceDetail service={service} />;
}
