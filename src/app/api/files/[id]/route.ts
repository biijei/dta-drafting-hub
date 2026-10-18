import { bucket } from "@/lib/files";
import { jsonError, jsonOk } from "@/lib/http";
import { requireStaff } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { trackedRequestId } from "@/lib/track-session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createServiceClient();
  const { data: file } = await supabase
    .from("files")
    .select("id, request_id, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (!file?.request_id || !file.storage_path) {
    return jsonError("File not found.", 404);
  }

  const [staff, sessionRequestId] = await Promise.all([
    requireStaff().catch(() => null),
    trackedRequestId(),
  ]);

  if (!staff && sessionRequestId !== file.request_id) {
    return jsonError("You do not have access to this file.", 401);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(file.storage_path, 60);

  if (error || !data?.signedUrl) {
    return jsonError("Could not prepare the download.", 500);
  }

  return jsonOk({ url: data.signedUrl });
}
