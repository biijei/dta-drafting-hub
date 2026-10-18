import { jsonError, jsonOk } from "@/lib/http";
import { loadTracked } from "@/lib/load-tracked";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const loaded = await loadTracked(id);

  if (loaded.status === 401) {
    return jsonError("Enter your Request ID and email to view this request.", 401);
  }

  if (!loaded.request) {
    return jsonError("Request not found.", 404);
  }

  return jsonOk(loaded.request);
}
