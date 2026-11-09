/**
 * Cashfree Return Page
 * Cashfree redirects back here after payment (redirect flow fallback).
 * The modal flow handles this inline, but redirect flow needs this page.
 */
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { paymentAPI } from "@/lib/api-client";
import { useCart } from "@/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout/cashfree-return")({
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: (search.order_id as string) || "",
  }),
  component: CashfreeReturnPage,
});

function CashfreeReturnPage() {
  const navigate = useNavigate();
  const cart     = useCart();
  const { order_id } = useSearch({ from: "/checkout/cashfree-return" });
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    if (!order_id) {
      navigate({ to: "/tracks" as any });
      return;
    }

    paymentAPI.verifyCashfreePayment(order_id)
      .then((res) => {
        const s = res.data.data?.status;
        if (s === "COMPLETED") {
          cart.clear();
          setStatus("success");
          toast.success("Payment successful! Redirecting to your orders...");
          setTimeout(() => navigate({ to: "/account/orders" as any }), 2000);
        } else {
          setStatus("failed");
          toast.error("Payment was not completed.");
        }
      })
      .catch(() => {
        setStatus("failed");
        toast.error("Could not verify payment. Please contact support.");
      });
  }, [order_id]);

  return (
    <div className="min-h-screen bg-background grid place-items-center">
      <div className="text-center space-y-4 p-8">
        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="font-semibold text-lg">Verifying your payment...</p>
            <p className="text-sm text-muted-foreground">Please wait, do not close this window</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-semibold text-lg">Payment Successful!</p>
            <p className="text-sm text-muted-foreground">Redirecting to your orders...</p>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="font-semibold text-lg">Payment Not Completed</p>
            <p className="text-sm text-muted-foreground">Your payment could not be verified.</p>
            <button
              onClick={() => navigate({ to: "/checkout" as any })}
              className="mt-4 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
