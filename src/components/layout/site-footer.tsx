import Image from "next/image";
import Link from "next/link";
import {
  footerCompany,
  footerLegal,
  footerServices,
  type NavItem,
} from "@/content/navigation";

function FooterColumn({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-white/55">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-sm text-white/90 transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <Image
                src="/icons/logo.svg"
                alt="DTA logo"
                width={40}
                height={36}
                unoptimized
                className="h-9 w-auto"
              />
            </div>
            <p className="text-base font-semibold text-gold">
              DTA Drafting Hub LLC
            </p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
            DTA Drafting Hub LLC is a professional drafting and
            document-support company that helps people turn their ideas,
            information, and requirements into clear, well-written, professional
            documents.
          </p>
        </div>
        <FooterColumn title="Services" items={footerServices} />
        <FooterColumn title="Company" items={footerCompany} />
        <FooterColumn title="Legal" items={footerLegal} />
      </div>

      <div className="mx-auto w-full max-w-[90rem] px-4 pb-8">
        <div className="border-t border-white/15 pt-6">
          <p className="text-xs leading-5 text-white/55">
            Disclaimer: DTA Drafting Hub provides document drafting, review, and
            related support services. Services provided through this platform
            may vary by jurisdiction and service type. Submitting a request
            does not by itself establish a lawyer-client relationship. Where
            legal advice or representation is required, clients should consult
            a qualified legal professional licensed in the relevant
            jurisdiction.
          </p>
          <p className="mt-6 text-center text-xs text-white/70">
            © 2026 DTA Drafting Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
