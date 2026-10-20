import { jsonError, jsonOk } from "@/lib/http";
import { loadTracked } from "@/lib/load-tracked";
import { sendApprovedAlert } from "@/lib/mail";
import { createServiceClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const loaded = await loadTracked(id);

  if (loaded.status === 401) {
    return jsonError("Enter your Request ID and email to view this request.", 401);
  }

  if (!loaded.row) {
    return jsonError("Request not found.", 404);
  }

  if (loaded.row.status !== "Awaiting Your Review") {
    return jsonError("This draft is not waiting for approval.", 400);
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("requests")
    .update({ status: "Approved", updated_at: new Date().toISOString() })
    .eq("id", loaded.row.id);

  if (error) {
    return jsonError("Could not approve the document.", 500);
  }

  await supabase.from("activity").insert({
    request_id: loaded.row.id,
    message: "Client approved the draft.",
  });

  await sendApprovedAlert({
    requestUuid: loaded.row.id,
    requestId: loaded.row.public_id,
    title: loaded.row.service_title,
    clientName: loaded.row.client_name,
  });

  return jsonOk({ ok: true });
}
