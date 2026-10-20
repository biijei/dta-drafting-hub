"use client";

import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useRef, useState } from "react";
import { toast } from "@/components/ui/toast";

type PaymentChooserProps = {
  requestId?: string;
  onPaid?: () => void;
};

const funding =
  "card,paylater,venmo,applepay,credit,bancontact,blik,eps,giropay,ideal,mybank,p24,sepa,sofort,trustly";

export function PaymentChooser({ requestId, onPaid }: PaymentChooserProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");

  if (!clientId) {
    return (
      <p className="text-sm text-gold" role="alert">
        Payment is not available right now.
      </p>
    );
  }

  if (paid) {
    return (
      <p className="text-sm font-medium text-lime" role="status">
        Payment received. Work has started.
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
        components: "buttons,applepay,googlepay",
        enableFunding: funding,
      }}
    >
      <ChooserButtons
        requestId={requestId}
        error={error}
        onError={setError}
        onPaid={() => {
          setPaid(true);
          toast.success("Payment received. Work has started.");
          onPaid?.();
        }}
      />
    </PayPalScriptProvider>
  );
}

function ChooserButtons({
  requestId,
  error,
  onError,
  onPaid,
}: {
  requestId?: string;
  error: string;
  onError: (message: string) => void;
  onPaid: () => void;
}) {
  const [{ isRejected }] = usePayPalScriptReducer();
  const reported = useRef(false);

  function report(message: string) {
    reported.current = true;
    onError(message);
  }

  async function createOrder() {
    reported.current = false;
    onError("");
    const response = await fetch("/api/paypal/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestId ? { requestId } : {}),
    });
    const body = (await response.json()) as { orderId?: string; error?: string };

    if (!response.ok || !body.orderId) {
      const message = body.error || "Could not start the payment.";
      report(message);
      throw new Error(message);
    }

    return body.orderId;
  }

  async function approve(data: { orderID: string }) {
    reported.current = false;
    onError("");
    const response = await fetch(
      `/api/paypal/orders/${encodeURIComponent(data.orderID)}/capture`,
      { method: "POST" },
    );
    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      const message = body.error || "Could not complete the payment.";
      report(message);
      throw new Error(message);
    }

    onPaid();
  }

  if (isRejected) {
    return (
      <p className="text-sm text-gold" role="alert">
        Payment options could not be loaded. Refresh the page and try again.
      </p>
    );
  }

  return (
    <div className="max-w-sm">
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect" }}
        createOrder={createOrder}
        onApprove={approve}
        onCancel={() => report("Payment was cancelled. Choose a method to try again.")}
        onError={() => {
          if (!reported.current) {
            report("Payment could not be completed. Choose a method to try again.");
          }
        }}
      />
      {error ? (
        <p className="mt-3 text-sm text-gold" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
