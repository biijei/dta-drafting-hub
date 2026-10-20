import { jsonError, jsonOk } from "@/lib/http";
import { markRequestPaid } from "@/lib/fulfill";
import { isRequestUuid, loadPayableRequest } from "@/lib/payable-request";
import { capturePaypalOrder, centsFromPaypal, getPaypalOrder } from "@/lib/paypal";
import { createServiceClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ orderId: string }> };

function alreadyCaptured(error: unknown) {
  const detail =
    error instanceof Error && "detail" in error
      ? String((error as Error & { detail?: string }).detail ?? "")
      : "";

  return detail.includes("ORDER_ALREADY_CAPTURED");
}

export async function POST(_request: Request, context: RouteContext) {
  const { orderId } = await context.params;

  if (!/^[A-Za-z0-9]+$/.test(orderId)) {
    return jsonError("This payment is no longer available.", 400);
  }

  try {
    const created = await getPaypalOrder(orderId);
    const requestId = created.purchase_units?.[0]?.custom_id ?? "";

    if (!isRequestUuid(requestId)) {
      return jsonError("This payment is no longer available.", 400);
    }

    const current = await loadPayableRequest(requestId);
    const quoted = centsFromPaypal(created.purchase_units?.[0]?.amount?.value);

    if (!current || quoted !== current.amount_cents) {
      return jsonError("This payment is no longer available.", 400);
    }

    const supabase = createServiceClient();
    const { data: saved, error } = await supabase
      .from("requests")
      .update({
        paypal_order_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .eq("status", "Awaiting Payment")
      .select("id");

    if (error || !saved?.length) {
      console.error(error);
      return jsonError("This payment is no longer available.", 400);
    }

    let captured = created;

    try {
      captured = await capturePaypalOrder(orderId);
    } catch (captureError) {
      if (!alreadyCaptured(captureError)) {
        throw captureError;
      }

      captured = await getPaypalOrder(orderId);
    }

    await markRequestPaid(orderId, captured);
    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Could not complete the payment.";
    return jsonError(message, 400);
  }
}
