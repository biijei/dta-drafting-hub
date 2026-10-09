import type { Metadata } from "next";
import { ServiceMarquee } from "@/app/about/_components/service-marquee";
import { HomeCta } from "@/app/_components/home-cta";
import { HomeFaq } from "@/app/_components/home-faq";
import { HomeHero } from "@/app/_components/home-hero";
import { HomeProcess } from "@/app/_components/home-process";
import { HomeServices } from "@/app/_components/home-services";
import { HomeTrack } from "@/app/_components/home-track";
import { HomeWhy } from "@/app/_components/home-why";

export const metadata: Metadata = {
  title: { absolute: "DTA Drafting Hub" },
  description:
    "Professional document drafting and review for contracts, business documents, immigration documents, and correspondence.",
};

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeServices />
      <ServiceMarquee tone="home" />
      <HomeProcess />
      <HomeWhy />
      <HomeTrack />
      <HomeFaq />
      <HomeCta />
    </>
  );
}
