import { jsonError, jsonOk } from "@/lib/http";
import { isRequestUuid, loadPayableRequest } from "@/lib/payable-request";
import { createPaypalOrder } from "@/lib/paypal";
import { createServiceClient } from "@/lib/supabase/admin";
import { trackedRequestId } from "@/lib/track-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { requestId?: unknown };
    const submitted =
      typeof body.requestId === "string" && isRequestUuid(body.requestId)
        ? body.requestId
        : null;
    const sessionId = await trackedRequestId();
    const requestId = submitted ?? sessionId;

    if (!requestId) {
      return jsonError("Open your payment link to pay.", 401);
    }

    const current = await loadPayableRequest(requestId);

    if (!current) {
      return jsonError("This payment is no longer available.", 400);
    }

    const amount = (current.amount_cents / 100).toFixed(2);
    const order = await createPaypalOrder({
      requestId: current.id,
      amount,
      description: current.service_title,
    });
    const supabase = createServiceClient();
    const { data: saved, error } = await supabase
      .from("requests")
      .update({
        paypal_order_id: order.orderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .eq("status", "Awaiting Payment")
      .select("id");

    if (error || !saved?.length) {
      console.error(error);
      return jsonError("Could not start the payment.", 500);
    }

    return jsonOk({ orderId: order.orderId });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Could not start the payment.";
    return jsonError(message, 400);
  }
}
