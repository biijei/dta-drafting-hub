import { createServiceClient } from "@/lib/supabase/admin";

const requestUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRequestUuid(value: string) {
  return requestUuid.test(value);
}

export async function loadPayableRequest(requestId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("requests")
    .select("id, public_id, service_title, status, amount_cents")
    .eq("id", requestId)
    .maybeSingle();

  if (!data || data.status !== "Awaiting Payment" || data.amount_cents < 1) {
    return null;
  }

  return data;
}
