import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the DTA Drafting Hub administration panel.",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="admin-app min-h-full flex-1 bg-[#0B1C4E]" />}>
      <LoginForm />
    </Suspense>
  );
}
