import { requireStaff } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import { jsonError, jsonOk } from "@/lib/http";
import { createServiceClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    const { id } = await context.params;
    const data = await loadAdminData();
    const request = data.requests.find((item) => item.id === id);

    if (!request) {
      return jsonError("Request not found.", 404);
    }

    return jsonOk({ request });
  } catch (error) {
    console.error(error);
    return jsonError("Could not load the request.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    const { id } = await context.params;
    const body = (await request.json()) as {
      assigneeId?: string | null;
      internalNote?: string;
      status?: string;
    };
    const supabase = createServiceClient();
    const { data: current } = await supabase
      .from("requests")
      .select("id, status, public_id")
      .eq("id", id)
      .maybeSingle();

    if (!current) {
      return jsonError("Request not found.", 404);
    }

    const patch: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };

    if ("internalNote" in body) {
      patch.internal_note = String(body.internalNote ?? "").slice(0, 5000);
    }

    if ("assigneeId" in body) {
      if (body.assigneeId) {
        const { data: assignee } = await supabase
          .from("profiles")
          .select("id, full_name, active")
          .eq("id", body.assigneeId)
          .eq("active", true)
          .maybeSingle();

        if (!assignee) {
          return jsonError("Choose an active team member.", 400);
        }

        patch.assignee_id = assignee.id;
        await supabase.from("activity").insert({
          request_id: id,
          message: `Assigned to ${assignee.full_name}.`,
        });
      } else {
        patch.assignee_id = null;
      }
    }

    if (body.status === "In Progress") {
      if (current.status !== "Submitted" && current.status !== "Revision Requested") {
        return jsonError("This request cannot be moved to In Progress.", 400);
      }

      patch.status = "In Progress";
      await supabase.from("activity").insert({
        request_id: id,
        message: "DTA started work on the request.",
      });
    }

    const { error } = await supabase.from("requests").update(patch).eq("id", id);

    if (error) {
      console.error(error);
      return jsonError("Could not update the request.", 500);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Could not update the request.", 500);
  }
}
