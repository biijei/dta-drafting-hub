import { requireStaff } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { sendCompleted, sendDraftReady } from "@/lib/mail";
import { storeFile } from "@/lib/storage";
import { createServiceClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    const { id } = await context.params;
    const form = await request.formData();
    const kind = String(form.get("kind") ?? "");
    const note = String(form.get("note") ?? "").trim();
    const file = form.get("file");

    if ((kind !== "draft" && kind !== "final") || !note) {
      return jsonError("Add a review note and choose draft or final.", 400);
    }

    if (!(file instanceof File) || file.size === 0) {
      return jsonError("Choose a file to upload.", 400);
    }

    const supabase = createServiceClient();
    const { data: current } = await supabase
      .from("requests")
      .select("id, status, public_id, service_title, client_email")
      .eq("id", id)
      .maybeSingle();

    if (!current) {
      return jsonError("Request not found.", 404);
    }

    if (current.status === "Pending Review" || current.status === "Awaiting Payment") {
      return jsonError("Upload a draft after the client has paid.", 400);
    }

    if (kind === "final" && current.status !== "Approved") {
      return jsonError("Upload the final document after the client approves the draft.", 400);
    }

    if (kind === "draft" && current.status === "Completed") {
      return jsonError("This request is already complete.", 400);
    }

    await storeFile({
      file,
      folder: `requests/${id}/${kind}`,
      kind,
      note,
      author: profile.full_name,
      requestId: id,
    });

    const nextStatus = kind === "final" ? "Completed" : "Awaiting Your Review";
    await supabase
      .from("requests")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    await supabase.from("activity").insert({
      request_id: id,
      message:
        kind === "final"
          ? "Final document uploaded and request completed."
          : "Draft uploaded for client review.",
    });

    if (kind === "draft") {
      await sendDraftReady({
        to: current.client_email,
        requestId: current.public_id,
        title: current.service_title,
        note,
      });
    } else {
      await sendCompleted({
        to: current.client_email,
        requestId: current.public_id,
        title: current.service_title,
      });
    }

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not upload the file.";
    return jsonError(message, 400);
  }
}
