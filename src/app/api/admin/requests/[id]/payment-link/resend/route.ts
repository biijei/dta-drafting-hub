import { requireStaff } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { sendPaymentLink } from "@/lib/mail";
import { paymentPageUrl } from "@/lib/paypal";
import { formatUsdCents } from "@/content/services";
import { createServiceClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    if (profile.role !== "owner") {
      return jsonError("Only an owner can send a payment link.", 403);
    }

    const { id } = await context.params;
    const supabase = createServiceClient();
    const { data: current } = await supabase
      .from("requests")
      .select(
        "id, status, public_id, service_title, client_email, amount_cents",
      )
      .eq("id", id)
      .maybeSingle();

    if (!current) {
      return jsonError("Request not found.", 404);
    }

    if (current.status !== "Awaiting Payment" || current.amount_cents < 1) {
      return jsonError("Generate a payment link before resending it.", 400);
    }

    const label = formatUsdCents(current.amount_cents);
    const url = paymentPageUrl(current.id);
    const { error } = await supabase
      .from("requests")
      .update({ payment_url: url, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "Awaiting Payment");

    if (error) {
      console.error(error);
      return jsonError("Could not resend the payment link.", 500);
    }

    await sendPaymentLink({
      to: current.client_email,
      requestId: current.public_id,
      title: current.service_title,
      amount: label,
      url,
    });

    await supabase.from("activity").insert({
      request_id: id,
      message: "Payment link resent.",
    });

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Could not resend the payment link.", 500);
  }
}
