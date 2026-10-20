type PayPalAmount = {
  currency_code?: string;
  value?: string;
};

type PayPalCapture = {
  id?: string;
  status?: string;
  amount?: PayPalAmount;
  supplementary_data?: { related_ids?: { order_id?: string } };
  custom_id?: string;
};

export type PayPalOrder = {
  id?: string;
  status?: string;
  links?: { href?: string; rel?: string }[];
  payment_source?: Record<string, unknown>;
  purchase_units?: {
    custom_id?: string;
    payments?: { captures?: PayPalCapture[] };
    amount?: PayPalAmount;
  }[];
};

const methodLabels: Record<string, string> = {
  apple_pay: "Apple Pay",
  bancontact: "Bancontact",
  bank: "Bank transfer",
  blik: "BLIK",
  card: "Card",
  credit: "PayPal Credit",
  eps: "EPS",
  giropay: "Giropay",
  google_pay: "Google Pay",
  ideal: "iDEAL",
  mybank: "MyBank",
  p24: "Przelewy24",
  pay_upon_invoice: "Bank transfer",
  paypal: "PayPal",
  sepa: "Bank transfer",
  sofort: "Sofort",
  trustly: "Trustly",
  venmo: "Venmo",
};

export function paymentPageUrl(requestId: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  return `${origin}/pay/${requestId}`;
}

export function methodFromOrder(order: PayPalOrder) {
  const key = order.payment_source ? Object.keys(order.payment_source)[0] : undefined;

  if (!key) {
    return "PayPal";
  }

  if (methodLabels[key]) {
    return methodLabels[key];
  }

  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function paypalBase() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

let tokenCache: { value: string; expiresAt: number } | null = null;

async function accessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.value;
  }

  const id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!id || !secret) {
    throw new Error("PayPal is not configured.");
  }

  const response = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("PayPal authentication failed.");
  }

  const body = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  tokenCache = {
    value: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
  return body.access_token;
}

async function paypalFetch(path: string, init?: RequestInit) {
  const token = await accessToken();
  const response = await fetch(`${paypalBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return response;
}

export function centsFromPaypal(value: string | undefined) {
  if (!value || !/^\d+\.\d{2}$/.test(value)) {
    return null;
  }

  return Math.round(Number(value) * 100);
}

export async function createPaypalOrder(input: {
  requestId: string;
  amount: string;
  description: string;
}) {
  const response = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.requestId,
          description: input.description.slice(0, 127),
          amount: { currency_code: "USD", value: input.amount },
        },
      ],
      application_context: {
        brand_name: "DTA Drafting Hub",
        landing_page: "BILLING",
        payment_method: { payee_preferred: "UNRESTRICTED" },
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: paymentPageUrl(input.requestId),
        cancel_url: paymentPageUrl(input.requestId),
      },
    }),
  });

  if (!response.ok) {
    throw new Error("PayPal could not start the payment.");
  }

  const order = (await response.json()) as PayPalOrder;

  if (!order.id) {
    throw new Error("PayPal could not start the payment.");
  }

  return { orderId: order.id };
}

export async function getPaypalOrder(orderId: string) {
  const response = await paypalFetch(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}`,
  );

  if (!response.ok) {
    throw new Error("PayPal could not load the payment.");
  }

  return (await response.json()) as PayPalOrder;
}

export async function capturePaypalOrder(orderId: string) {
  const response = await paypalFetch(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    { method: "POST" },
  );

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error("PayPal could not capture the payment.") as Error & {
      detail?: string;
    };
    error.detail = detail;
    throw error;
  }

  return (await response.json()) as PayPalOrder;
}

export function captureFromOrder(order: PayPalOrder) {
  return order.purchase_units?.[0]?.payments?.captures?.[0];
}

export async function verifyPaypalWebhook(headers: Headers, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    throw new Error("PayPal webhook ID is not configured.");
  }

  const response = await paypalFetch(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: event,
      }),
    },
  );

  if (!response.ok) {
    return false;
  }

  const body = (await response.json()) as { verification_status?: string };
  return body.verification_status === "SUCCESS";
}
