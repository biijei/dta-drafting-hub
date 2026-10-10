import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the DTA Drafting Hub administration panel.",
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
