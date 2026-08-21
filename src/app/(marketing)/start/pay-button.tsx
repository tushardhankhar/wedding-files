"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createOrderAction,
  verifyPaymentAction,
} from "@/modules/self-serve/server/payment-actions";
import { PRICE_LABEL } from "@/modules/self-serve/pricing";
import {
  trackBeginCheckout,
  trackPurchase,
} from "@/modules/self-serve/client/analytics";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** What Razorpay hands back to `handler` on a successful payment. */
interface CheckoutSuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface CheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: CheckoutSuccess) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => { open: () => void };
  }
}

/**
 * Loads Razorpay's checkout script once, on demand.
 *
 * Deliberately not `next/script` in the page: this is third-party JS that only
 * matters to the handful of visitors who reach the review step and press Pay,
 * so it stays off the critical path for everyone else — including the ones who
 * abandon at the theme picker.
 */
function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("load failed"));
    document.body.appendChild(script);
  });
}

/**
 * The ₹299 checkout.
 *
 * Note what this component never sees: a price. It asks the server to create an
 * order and is handed back only an order id to open — the amount is decided,
 * and charged, entirely server-side. `PRICE_LABEL` here is a caption.
 */
export function PayButton({ themeId }: { themeId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);

    try {
      await loadCheckout();
    } catch {
      setError("We couldn't reach the payment window. Check your connection and try again.");
      setBusy(false);
      return;
    }

    const order = await createOrderAction();
    if (!order.ok) {
      setError(order.error);
      setBusy(false);
      return;
    }

    if (!window.Razorpay) {
      setError("The payment window didn't load. Please refresh and try again.");
      setBusy(false);
      return;
    }

    // Announced now rather than on the click: a click that never produced an
    // order isn't a checkout, and counting it as one hides the failure.
    trackBeginCheckout(order.orderId);

    new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "Join the Jashn",
      description: "Your celebration invitation",
      prefill: {
        name: order.name,
        email: order.email,
        contact: order.phone,
      },
      theme: { color: "#7a1f3d" },
      handler: (response) => {
        // Verify server-side before believing anything the browser reports —
        // and keep the button busy, because navigation follows.
        void (async () => {
          const result = await verifyPaymentAction(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          if (!result.ok) {
            setError(result.error);
            setBusy(false);
            return;
          }
          // Before the redirect, not after: /weddings/[id] sits outside the
          // (marketing) group and loads no tags, so a purchase announced there
          // is announced to nobody. This is the event campaigns optimise on —
          // if it fires late, it doesn't fire.
          trackPurchase(response.razorpay_payment_id, themeId);
          router.replace(`/weddings/${result.weddingId}`);
        })();
      },
      modal: {
        // Closing the sheet without paying must return the button to normal,
        // or a change of mind looks like a hang.
        ondismiss: () => setBusy(false),
      },
    }).open();
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="w-full"
        onClick={pay}
        disabled={busy}
      >
        {busy ? <Spinner /> : null}
        {busy ? "Opening payment…" : `Pay ${PRICE_LABEL} & create my invitation`}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-center text-[11px] text-muted-foreground">
        Secured by Razorpay · UPI, cards, netbanking & wallets
      </p>
    </div>
  );
}
