import { requireStaff } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { sendPaymentLink } from "@/lib/mail";
import { paymentPageUrl } from "@/lib/paypal";
import { formatUsdCents } from "@/content/services";
import { createServiceClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

const openStatuses = new Set(["Pending Review", "Awaiting Payment"]);

export async function POST(request: Request, context: RouteContext) {
  try {
    const profile = await requireStaff();

    if (!profile) {
      return jsonError("Sign in required.", 401);
    }

    if (profile.role !== "owner") {
      return jsonError("Only an owner can send a payment link.", 403);
    }

    const { id } = await context.params;
    const body = (await request.json()) as { amount?: unknown };
    const raw = String(body.amount ?? "").trim();

    if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
      return jsonError("Enter a USD amount.", 400);
    }

    const cents = Math.round(Number(raw) * 100);

    if (cents < 1) {
      return jsonError("Enter a USD amount.", 400);
    }

    const supabase = createServiceClient();
    const { data: current } = await supabase
      .from("requests")
      .select("id, status, public_id, service_title, client_email")
      .eq("id", id)
      .maybeSingle();

    if (!current) {
      return jsonError("Request not found.", 404);
    }

    if (!openStatuses.has(current.status)) {
      return jsonError("This request already has a confirmed payment.", 400);
    }

    const url = paymentPageUrl(current.id);
    const { data: saved, error } = await supabase
      .from("requests")
      .update({
        amount_cents: cents,
        paypal_order_id: null,
        payment_url: url,
        status: "Awaiting Payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .in("status", ["Pending Review", "Awaiting Payment"])
      .select("id");

    if (error || !saved?.length) {
      console.error(error);
      return jsonError("Could not save the payment link.", 500);
    }

    const label = formatUsdCents(cents);

    await supabase.from("activity").insert({
      request_id: id,
      message: `Payment link emailed for ${label}.`,
    });

    await sendPaymentLink({
      to: current.client_email,
      requestId: current.public_id,
      title: current.service_title,
      amount: label,
      url,
    });

    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Could not create the payment link.";
    return jsonError(message, 400);
  }
}
