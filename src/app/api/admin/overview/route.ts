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
    return jsonOk({
      stats: data.stats,
      pending: data.pending,
      recentRequests: data.requests.slice(0, 5),
      recentPayments: data.payments.slice(0, 4),
    });
  } catch (error) {
    console.error(error);
    return jsonError("Could not load the overview.", 500);
  }
}
