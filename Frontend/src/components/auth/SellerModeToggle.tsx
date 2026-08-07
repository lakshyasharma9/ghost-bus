import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Clock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { userAPI } from '@/lib/api-client';

type AppStatus = {
  applicationStatus: string | null;
  sellerVerified: boolean;
  sellerModeEnabled: boolean;
  kyc: { status: string; rejectionReason?: string } | null;
} | null;

export function SellerModeToggle() {
  const { sellerModeEnabled, toggleSellerMode, profile } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [appStatus, setAppStatus] = useState<AppStatus>(null);

  useEffect(() => {
    userAPI.getSellerApplicationStatus()
      .then((res: any) => setAppStatus(res.data?.data ?? res.data))
      .catch(() => setAppStatus(null))
      .finally(() => setStatusLoading(false));
  }, [sellerModeEnabled]);

  const handleEnableSeller = () => {
    // If already verified, toggle seller mode directly
    if (appStatus?.sellerVerified) {
      setLoading(true);
      toggleSellerMode(true)
        .then(() => toast.success('Seller Mode Enabled'))
        .catch(() => toast.error('Failed to enable seller mode'))
        .finally(() => setLoading(false));
      return;
    }
    // Otherwise send them to the seller application form
    navigate({ to: '/apply-seller' });
  };

  const handleDisableSeller = () => {
    setLoading(true);
    toggleSellerMode(false)
      .then(() => toast.success('Switched back to buyer mode'))
      .catch(() => toast.error('Failed to disable seller mode'))
      .finally(() => setLoading(false));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seller Mode</CardTitle>
        <CardDescription>Switch between buyer and seller dashboards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Currently in seller mode */}
        {sellerModeEnabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-800 font-medium">Seller Dashboard is Active</p>
            </div>
            <button
              onClick={handleDisableSeller}
              disabled={loading}
              className="h-10 px-5 rounded-full border border-border bg-card text-sm font-medium hover:bg-muted transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Switch to Buyer Mode
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {statusLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking status…
              </div>
            ) : appStatus?.applicationStatus === 'pending' ? (
              /* Pending review */
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Application Under Review</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your seller application is being reviewed by our team. You will be notified once approved.
                  </p>
                  <button
                    onClick={() => navigate({ to: '/apply-seller' })}
                    className="mt-2 text-xs text-amber-800 underline hover:no-underline"
                  >
                    View application status →
                  </button>
                </div>
              </div>
            ) : appStatus?.applicationStatus === 'rejected' ? (
              /* Rejected — allow resubmission */
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-rose-800">Application Rejected</p>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Your previous application was rejected. Please resubmit with corrected information.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate({ to: '/apply-seller' })}
                  className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[--color-primary-hover] transition flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Resubmit Application
                </button>
              </div>
            ) : (
              /* Not applied yet */
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  To sell tracks on GhostBus, you need to complete identity verification. This takes 2–3 business days.
                </p>
                <button
                  onClick={handleEnableSeller}
                  disabled={loading}
                  className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[--color-primary-hover] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Start Selling
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
