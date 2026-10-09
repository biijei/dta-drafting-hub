import { services } from "@/content/services";

export type NavItem = {
  label: string;
  href: string;
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Service", href: "/service" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Track Request", href: "/track-request" },
];

export const footerServices: NavItem[] = services.map((service) => ({
  label: service.title,
  href: `/service/${service.slug}`,
}));

export const footerCompany: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Our Process", href: "/process" },
  { label: "FAQ", href: "/faq" },
  { label: "Track Request", href: "/track-request" },
];

export const footerLegal: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export const requestServiceHref = "/service";

export function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/service") {
    return (
      pathname === "/service" ||
      pathname.startsWith("/service/") ||
      pathname === "/request" ||
      pathname.startsWith("/request/")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
