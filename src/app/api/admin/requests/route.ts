import { requireStaff } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET() {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    const data = await loadAdminData();
    return jsonOk({ requests: data.requests });
  } catch (error) {
    console.error(error);
    return jsonError("Could not load requests.", 500);
  }
}
