import { markRequestPaid } from "@/lib/fulfill";
import { jsonError, jsonOk } from "@/lib/http";
import { loadPayableRequest } from "@/lib/payable-request";
import {
  capturePaypalOrder,
  centsFromPaypal,
  getPaypalOrder,
  verifyPaypalWebhook,
  type PayPalOrder,
} from "@/lib/paypal";

type PayPalEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: { currency_code?: string; value?: string };
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
};

function alreadyCaptured(error: unknown) {
  const detail =
    error instanceof Error && "detail" in error
      ? String((error as Error & { detail?: string }).detail ?? "")
      : "";

  return detail.includes("ORDER_ALREADY_CAPTURED");
}

export async function POST(request: Request) {
  const raw = await request.text();
  let event: PayPalEvent;

  try {
    event = JSON.parse(raw) as PayPalEvent;
  } catch {
    return jsonError("Invalid webhook.", 400);
  }

  try {
    const verified = await verifyPaypalWebhook(request.headers, event);

    if (!verified) {
      return jsonError("Webhook signature was rejected.", 401);
    }
  } catch (error) {
    console.error(error);
    return jsonError("Webhook could not be verified.", 400);
  }

  if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
    const orderId = event.resource?.id;

    if (!orderId) {
      return jsonError("Webhook is missing the PayPal order.", 400);
    }

    try {
      const approved = await getPaypalOrder(orderId);
      const requestId = approved.purchase_units?.[0]?.custom_id ?? "";
      const current = await loadPayableRequest(requestId);
      const quoted = centsFromPaypal(approved.purchase_units?.[0]?.amount?.value);

      if (!current || quoted !== current.amount_cents) {
        return jsonOk({ ok: true });
      }

      await capturePaypalOrder(orderId);
    } catch (error) {
      if (alreadyCaptured(error)) {
        return jsonOk({ ok: true });
      }

      console.error(error);
      return jsonError("Could not capture the PayPal order.", 500);
    }

    return jsonOk({ ok: true });
  }

  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return jsonOk({ ok: true });
  }

  const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
  const capture = event.resource;

  if (!orderId || !capture?.id) {
    return jsonError("Webhook is missing the PayPal order.", 400);
  }

  const fallback: PayPalOrder = {
    id: orderId,
    status: "COMPLETED",
    purchase_units: [
      {
        payments: {
          captures: [
            {
              id: capture.id,
              status: capture.status,
              amount: capture.amount,
            },
          ],
        },
      },
    ],
  };

  let order = fallback;

  try {
    const loaded = await getPaypalOrder(orderId);
    const captured = loaded.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    order = captured ? loaded : { ...fallback, payment_source: loaded.payment_source };
  } catch (error) {
    console.error(error);
  }

  try {
    await markRequestPaid(orderId, order);
  } catch (error) {
    console.error(error);
    return jsonError("Could not record the payment.", 500);
  }

  return jsonOk({ ok: true });
}
