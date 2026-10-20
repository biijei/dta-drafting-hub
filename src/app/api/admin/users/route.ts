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

    const data = await loadAdminData();
    return jsonOk({ users: data.staff });
  } catch (error) {
    console.error(error);
    return jsonError("Could not load the team.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    if (profile.role !== "owner") {
      return jsonError("Only an owner can add a team member.", 403);
    }

    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
    };
    const fullName = body.fullName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!fullName || !email || password.length < 8) {
      return jsonError("Enter a name, email, and a password of at least 8 characters.", 400);
    }

    const supabase = createServiceClient();
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      return jsonError(error.message || "Could not create that user.", 400);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Could not create that user.", 500);
  }
}
