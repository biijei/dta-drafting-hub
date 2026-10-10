"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminProvider, readSession } from "@/lib/admin-store";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!readSession()) {
      router.replace("/admin/login");
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return <div className="admin-app min-h-full flex-1 bg-[#F3F4F6]" />;
  }

  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
