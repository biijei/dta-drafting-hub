import { createServiceClient } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export type StaffRole = "owner" | "specialist";

export type StaffProfile = {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  active: boolean;
};

export function publicProfile(profile: StaffProfile) {
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
  };
}

export async function requireStaff() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, email, role, active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.active) {
    return null;
  }

  return profile as StaffProfile;
}
