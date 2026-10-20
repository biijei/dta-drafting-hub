import { jsonError, jsonOk } from "@/lib/http";
import { createServiceClient } from "@/lib/supabase/admin";
import { startTrackSession } from "@/lib/track-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { requestId?: string; email?: string };
    const requestId = body.requestId?.trim().toUpperCase() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!requestId || !email) {
      return jsonError("Enter your Request ID and the email used when submitting.", 400);
    }

    const supabase = createServiceClient();
    const { data } = await supabase
      .from("requests")
      .select("id, public_id, client_email")
      .eq("public_id", requestId)
      .maybeSingle();

    if (!data || data.client_email !== email) {
      return jsonError("We couldn't find a request with that ID and email.", 404);
    }

    await startTrackSession(data.id);
    return jsonOk({ id: data.public_id });
  } catch (error) {
    console.error(error);
    return jsonError("Could not look up that request.", 500);
  }
}
