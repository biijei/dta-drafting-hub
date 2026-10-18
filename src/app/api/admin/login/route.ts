import { publicProfile, requireStaff } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return jsonError("Enter your email and password.", 400);
    }

    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return jsonError("Incorrect email or password.", 401);
    }

    const profile = await requireStaff();

    if (!profile) {
      await supabase.auth.signOut();
      return jsonError("This account is not active.", 403);
    }

    return jsonOk({ profile: publicProfile(profile) });
  } catch (error) {
    console.error(error);
    return jsonError("Could not sign in.", 500);
  }
}
