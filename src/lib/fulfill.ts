import { sendPaymentReceivedAlert, sendWorkStarted } from "@/lib/mail";
import { centsFromPaypal, type PayPalOrder } from "@/lib/paypal";
import { createServiceClient } from "@/lib/supabase/admin";

export async function markRequestPaid(orderId: string, order: PayPalOrder) {
  const capture = order.purchase_units?.[0]?.payments?.captures?.[0];

  if (!capture?.id || capture.status !== "COMPLETED") {
    throw new Error("Payment was not completed.");
  }

  const cents = centsFromPaypal(capture.amount?.value);

  if (capture.amount?.currency_code !== "USD" || cents == null) {
    throw new Error("Payment currency was not USD.");
  }

  const supabase = createServiceClient();
  const { data: request } = await supabase
    .from("requests")
    .select("id, public_id, amount_cents, status, client_email, client_name, service_title")
    .eq("paypal_order_id", orderId)
    .maybeSingle();

  if (!request) {
    throw new Error("Request was not found for this PayPal order.");
  }

  if (request.amount_cents !== cents) {
    throw new Error("Payment amount did not match the quoted price.");
  }

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("paypal_capture_id", capture.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("payments").insert({
      request_id: request.id,
      paypal_order_id: orderId,
      paypal_capture_id: capture.id,
      amount_cents: cents,
      status: "Paid",
      method: "PayPal",
      paid_at: new Date().toISOString(),
    });

    if (error && !String(error.message).toLowerCase().includes("duplicate")) {
      console.error(error);
      throw new Error("Could not save the payment.");
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("requests")
    .update({ status: "Submitted", updated_at: new Date().toISOString() })
    .eq("id", request.id)
    .eq("status", "Awaiting Payment")
    .select("id");

  if (updateError) {
    console.error(updateError);
    throw new Error("Could not mark the request paid.");
  }

  if (!updated?.length) {
    return;
  }

  await supabase.from("activity").insert({
    request_id: request.id,
    message: "Payment confirmed. Work has started.",
  });

  if (request.client_email) {
    await sendWorkStarted({
      to: request.client_email,
      requestId: request.public_id,
      title: request.service_title,
    });
  }

  await sendPaymentReceivedAlert({
    requestUuid: request.id,
    requestId: request.public_id,
    title: request.service_title,
    clientName: request.client_name,
  });
}
