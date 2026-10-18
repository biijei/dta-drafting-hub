import { publicProfile, requireStaff } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET() {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    return jsonOk({ profile: publicProfile(profile) });
  } catch (error) {
    console.error(error);
    return jsonError("Could not load your account.", 500);
  }
}
