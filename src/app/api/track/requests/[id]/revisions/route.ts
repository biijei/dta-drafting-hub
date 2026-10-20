import { jsonError, jsonOk } from "@/lib/http";
import { loadTracked } from "@/lib/load-tracked";
import { sendRevisionAlert } from "@/lib/mail";
import { storeFile } from "@/lib/storage";
import { createServiceClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const loaded = await loadTracked(id);

  if (loaded.status === 401) {
    return jsonError("Enter your Request ID and email to view this request.", 401);
  }

  if (!loaded.row) {
    return jsonError("Request not found.", 404);
  }

  if (loaded.row.status !== "Awaiting Your Review") {
    return jsonError("A revision can be requested when a draft is ready for review.", 400);
  }

  try {
    const form = await request.formData();
    const fileId = String(form.get("fileId") ?? "");
    const note = String(form.get("note") ?? "").trim();

    if (!fileId || !note) {
      return jsonError("Select a file and describe the changes you'd like made.", 400);
    }

    const supabase = createServiceClient();
    const { data: target } = await supabase
      .from("files")
      .select("id, kind")
      .eq("id", fileId)
      .eq("request_id", loaded.row.id)
      .eq("kind", "draft")
      .maybeSingle();

    if (!target) {
      return jsonError("Select a draft to revise.", 400);
    }

    const { data: revision, error } = await supabase
      .from("revisions")
      .insert({
        request_id: loaded.row.id,
        target_file_id: target.id,
        note,
      })
      .select("id")
      .single();

    if (error || !revision) {
      return jsonError("Could not save the revision request.", 500);
    }

    const uploads = form
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0)
      .slice(0, 8);

    for (const file of uploads) {
      await storeFile({
        file,
        folder: `requests/${loaded.row.id}/revisions`,
        kind: "revision",
        note,
        author: loaded.row.client_name,
        requestId: loaded.row.id,
        revisionId: revision.id,
      });
    }

    await supabase
      .from("requests")
      .update({
        status: "Revision Requested",
        updated_at: new Date().toISOString(),
      })
      .eq("id", loaded.row.id);

    await supabase.from("activity").insert({
      request_id: loaded.row.id,
      message: "Client requested changes.",
    });

    await sendRevisionAlert({
      requestUuid: loaded.row.id,
      requestId: loaded.row.public_id,
      clientName: loaded.row.client_name,
      note,
    });

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Could not save the revision request.";
    return jsonError(message, 400);
  }
}
