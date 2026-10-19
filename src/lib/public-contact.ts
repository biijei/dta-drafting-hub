import { connection } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";

export type PublicContact = {
  email: string;
  phone: string;
};

export async function loadPublicContact(): Promise<PublicContact> {
  await connection();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("settings")
    .select("primary_email, phone")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load contact details.");
  }

  return {
    email: data?.primary_email?.trim() ?? "",
    phone: data?.phone?.trim() ?? "",
  };
}
