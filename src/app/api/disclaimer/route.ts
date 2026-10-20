import { jsonError, jsonOk } from "@/lib/http";
import { loadPublicDisclaimer } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const disclaimer = await loadPublicDisclaimer();
    return jsonOk({ disclaimer });
  } catch (error) {
    console.error(error);
    return jsonError("Could not load the disclaimer.", 500);
  }
}
