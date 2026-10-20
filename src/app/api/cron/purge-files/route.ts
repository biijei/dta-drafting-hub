import { jsonError, jsonOk } from "@/lib/http";
import { purgeExpiredFiles } from "@/lib/purge-files";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonError("Not found.", 404);
  }

  try {
    await purgeExpiredFiles();
    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Could not purge files.", 500);
  }
}
