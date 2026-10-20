import type { StaffMember } from "@/content/admin";
import {
  overviewStats,
  paymentSummary,
  pendingActions,
  toAdminRequest,
  toClients,
  toPayments,
  type RequestRow,
} from "@/lib/records";
import { purgeExpiredFiles } from "@/lib/purge-files";
import { createServiceClient } from "@/lib/supabase/admin";

export async function loadAdminData() {
  try {
    await purgeExpiredFiles();
  } catch (error) {
    console.error(error);
  }

  const supabase = createServiceClient();
  const [requestsRes, filesRes, revisionsRes, paymentsRes, profilesRes, settingsRes] =
    await Promise.all([
      supabase.from("requests").select("*").order("created_at", { ascending: false }),
      supabase.from("files").select("*").order("created_at", { ascending: false }),
      supabase.from("revisions").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email, role, active").order("full_name"),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);

  const failed = [
    requestsRes.error,
    filesRes.error,
    revisionsRes.error,
    paymentsRes.error,
    profilesRes.error,
    settingsRes.error,
  ].find(Boolean);

  if (failed) {
    console.error(failed);
    throw new Error("Could not load admin data.");
  }

  const requests = (requestsRes.data ?? []) as RequestRow[];
  const files = filesRes.data ?? [];
  const revisions = revisionsRes.data ?? [];
  const payments = paymentsRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const adminRequests = requests.map((request) =>
    toAdminRequest(request, files, revisions, profiles),
  );
  const adminPayments = toPayments(payments, requests);
  const staff: StaffMember[] = profiles.map((profile) => ({
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    active: profile.active,
  }));
  const settingsRow = settingsRes.data;

  return {
    requests: adminRequests,
    clients: toClients(requests, payments),
    payments: adminPayments,
    staff,
    settings: {
      businessName: settingsRow?.business_name ?? "",
      primaryEmail: settingsRow?.primary_email ?? "",
      phone: settingsRow?.phone ?? "",
      address: settingsRow?.address ?? "",
      disclaimer: settingsRow?.disclaimer ?? "",
    },
    stats: overviewStats(requests, payments),
    paymentSummary: paymentSummary(payments),
    pending: pendingActions(adminRequests),
  };
}
