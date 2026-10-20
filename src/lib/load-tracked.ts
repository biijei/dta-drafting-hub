import { toTrackedRequest, type RequestRow } from "@/lib/records";
import { createServiceClient } from "@/lib/supabase/admin";
import { trackedRequestId } from "@/lib/track-session";

export async function loadTracked(publicId: string) {
  const requestUuid = await trackedRequestId();

  if (!requestUuid) {
    return { status: 401 as const, request: null };
  }

  const supabase = createServiceClient();
  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestUuid)
    .maybeSingle();

  if (!request || request.public_id.toUpperCase() !== publicId.trim().toUpperCase()) {
    return { status: 404 as const, request: null };
  }

  const [filesRes, activityRes, paymentRes, revisionsRes, assigneeRes] = await Promise.all([
    supabase.from("files").select("*").eq("request_id", request.id),
    supabase.from("activity").select("id, message, created_at").eq("request_id", request.id),
    supabase.from("payments").select("*").eq("request_id", request.id).maybeSingle(),
    supabase.from("revisions").select("*").eq("request_id", request.id),
    request.assignee_id
      ? supabase
          .from("profiles")
          .select("full_name")
          .eq("id", request.assignee_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    status: 200 as const,
    request: toTrackedRequest(
      request as RequestRow,
      filesRes.data ?? [],
      activityRes.data ?? [],
      paymentRes.data ?? undefined,
      assigneeRes.data?.full_name ?? null,
      revisionsRes.data ?? [],
    ),
    row: request as RequestRow,
  };
}
