import { bucket } from "@/lib/files";
import { requireStaff } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { createServiceClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    const { id } = await context.params;
    const supabase = createServiceClient();
    const { data: file } = await supabase
      .from("files")
      .select("id, kind, storage_path, request_id")
      .eq("id", id)
      .maybeSingle();

    if (!file) {
      return jsonError("File not found.", 404);
    }

    if (file.kind !== "draft") {
      return jsonError("Only draft files can be deleted.", 400);
    }

    if (file.storage_path) {
      await supabase.storage.from(bucket).remove([file.storage_path]);
    }

    const { error } = await supabase.from("files").delete().eq("id", id);

    if (error) {
      return jsonError("Could not delete the file.", 500);
    }

    if (file.request_id) {
      await supabase.from("activity").insert({
        request_id: file.request_id,
        message: "A draft file was removed.",
      });
    }

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Could not delete the file.", 500);
  }
}
