import { requireStaff } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    const body = (await request.json()) as { current?: string; next?: string };
    const current = body.current ?? "";
    const next = body.next ?? "";

    if (!current || next.length < 8) {
      return jsonError("Enter your current password and a new password of at least 8 characters.", 400);
    }

    if (current === next) {
      return jsonError("Choose a new password that is different.", 400);
    }

    const supabase = await createSupabaseServer();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: current,
    });

    if (signInError) {
      return jsonError("The current password is incorrect.", 400);
    }

    const { error } = await supabase.auth.updateUser({ password: next });

    if (error) {
      return jsonError(error.message || "Could not update the password.", 400);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Could not update the password.", 500);
  }
}
