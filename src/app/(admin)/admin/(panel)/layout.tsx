"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminProvider } from "@/lib/admin-store";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/me").then((response) => {
      if (!response.ok) {
        const next = pathname.startsWith("/admin/") ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/admin/login${next}`);
        return;
      }

      setAllowed(true);
    });
  }, [pathname, router]);

  if (!allowed) {
    return <div className="admin-app min-h-full flex-1 bg-[#F3F4F6]" />;
  }

  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
