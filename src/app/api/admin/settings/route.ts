import { requireStaff } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import { jsonError, jsonOk } from "@/lib/http";
import { createServiceClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    if (profile.role !== "owner") {
      return jsonError("Only an owner can view business settings.", 403);
    }

    const data = await loadAdminData();
    return jsonOk({ settings: data.settings });
  } catch (error) {
    console.error(error);
    return jsonError("Could not load settings.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    if (profile.role !== "owner") {
      return jsonError("Only an owner can change business settings.", 403);
    }

    const body = (await request.json()) as {
      businessName?: string;
      primaryEmail?: string;
      phone?: string;
      address?: string;
      disclaimer?: string;
    };
    const patch: Record<string, string> = {};

    if ("businessName" in body) patch.business_name = String(body.businessName ?? "").slice(0, 160);
    if ("primaryEmail" in body) patch.primary_email = String(body.primaryEmail ?? "").trim().slice(0, 200);
    if ("phone" in body) patch.phone = String(body.phone ?? "").slice(0, 40);
    if ("address" in body) patch.address = String(body.address ?? "").slice(0, 240);
    if ("disclaimer" in body) patch.disclaimer = String(body.disclaimer ?? "").slice(0, 4000);

    const supabase = createServiceClient();
    const { error } = await supabase.from("settings").update(patch).eq("id", 1);

    if (error) {
      return jsonError("Could not save settings.", 500);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Could not save settings.", 500);
  }
}
