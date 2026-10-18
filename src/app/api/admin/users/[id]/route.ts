import { requireStaff } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { createServiceClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    if (profile.role !== "owner") {
      return jsonError("Only an owner can change team access.", 403);
    }

    const { id } = await context.params;
    const body = (await request.json()) as { active?: boolean };

    if (typeof body.active !== "boolean") {
      return jsonError("Choose whether this account stays active.", 400);
    }

    if (id === profile.id && !body.active) {
      return jsonError("You cannot deactivate your own account.", 400);
    }

    const supabase = createServiceClient();
    const { data: target } = await supabase
      .from("profiles")
      .select("id, role, active")
      .eq("id", id)
      .maybeSingle();

    if (!target) {
      return jsonError("Team member not found.", 404);
    }

    if (target.role === "owner" && !body.active) {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "owner")
        .eq("active", true);

      if ((count ?? 0) <= 1) {
        return jsonError("The last owner cannot be deactivated.", 400);
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ active: body.active })
      .eq("id", id);

    if (error) {
      return jsonError("Could not update that account.", 500);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Could not update that account.", 500);
  }
}
