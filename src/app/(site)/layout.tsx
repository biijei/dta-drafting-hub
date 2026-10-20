import { ContactDock } from "@/components/layout/contact-dock";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { loadPublicContact } from "@/lib/public-contact";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let contact = { email: "", phone: "" };

  try {
    contact = await loadPublicContact();
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
      <ContactDock email={contact.email} phone={contact.phone} />
    </>
  );
}
