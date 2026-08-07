import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Tabs, DataTable, StatusBadge, Button } from "@/components/admin/ui";
import { fmtDate } from "@/lib/admin-mock";
import { useAdminApplications, useReviewApplication } from "@/lib/use-admin-api";
import type { ApplicationRow } from "@/lib/api";

function SellerApplicationsPage() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const params: Record<string, string> = { limit: "50" };
  if (tab !== "all") params.status = tab;

  const { data, isLoading } = useAdminApplications(params);
  const review = useReviewApplication();
  const rows: ApplicationRow[] = (data as any)?.applications ?? [];

  const count = (s: string) => rows.filter((a: ApplicationRow) => a.sellerApplicationStatus === s).length;

  // Parse bio JSON — backend stores the full application here
  const parseAppData = (bio: string | null) => {
    if (!bio) return null;
    try {
      const parsed = JSON.parse(bio);
      // Parse tracksData if it's a JSON string
      if (parsed.tracksData && typeof parsed.tracksData === 'string') {
        try { parsed.tracks = JSON.parse(parsed.tracksData); } catch (_) {}
      }
      return typeof parsed === 'object' ? parsed : null;
    } catch { return null; }
  };

  return (
    <div>
      <PageHeader title="Seller Applications" description="Review and approve users who want to sell on GhostBus." />
      <Tabs
        active={tab}
        onChange={t => setTab(t as typeof tab)}
        tabs={[
          { id: "pending", label: "Pending", count: count("pending") },
          { id: "approved", label: "Approved", count: count("approved") },
          { id: "rejected", label: "Rejected", count: count("rejected") },
          { id: "all", label: "All", count: rows.length },
        ]}
      />
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No applications found.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((a: ApplicationRow) => {
            const appData = parseAppData(a.bio ?? null);
            const isExpanded = expandedId === a.id;
            // Try to extract documentType from KYC submissions bio structure
            const artistAlias = appData?.artistAlias || appData?.fullName || a.fullName || '—';
            const country = appData?.country || '—';
            const whyJoin = appData?.whyJoin || '—';
            const tracks = appData?.tracks || [];

            return (
              <div key={a.id} className="rounded-xl border bg-card overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-sm">{a.fullName ?? '—'}</p>
                      <StatusBadge status={a.sellerApplicationStatus ?? 'pending'} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.email} · Artist: {artistAlias} · {country}</p>
                    <p className="text-xs text-muted-foreground">Applied {fmtDate(a.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                      {isExpanded ? 'Collapse' : 'View Details'}
                    </Button>
                    {a.sellerApplicationStatus === "pending" && <>
                      <Button size="sm" variant="success"
                        onClick={() => review.mutate({ id: a.id, action: "approve" })}
                        disabled={review.isPending}>Approve</Button>
                      <Button size="sm" variant="danger"
                        onClick={() => review.mutate({ id: a.id, action: "reject" })}
                        disabled={review.isPending}>Reject</Button>
                    </>}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 px-5 py-5 space-y-5 text-sm">
                    {!appData ? (
                      <p className="text-muted-foreground text-xs italic">No detailed application data found. This may be an older submission.</p>
                    ) : (
                      <>
                        {/* ── Section 1: Applicant Identity ── */}
                        <div>
                          <p className="label-eyebrow mb-3">Applicant Identity</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <InfoField label="Full Name" value={appData.fullName} />
                            <InfoField label="Artist Alias" value={appData.artistAlias} />
                            <InfoField label="Label Name" value={appData.labelName} />
                            <InfoField label="Country" value={appData.country} />
                            <InfoField label="Address" value={appData.address} />
                            <InfoField label="Phone" value={appData.phone} />
                            <InfoField label="Alt Phone" value={appData.altPhone} />
                            <InfoField label="Business Email" value={appData.businessEmail || appData.paypalEmail} />
                            <InfoField label="PayPal Email" value={appData.paypalEmail} />
                          </div>
                        </div>

                        {/* ── Section 2: Social Links ── */}
                        {(appData.spotify || appData.instagram || appData.soundcloud || appData.youtube || appData.otherLinks) && (
                          <div>
                            <p className="label-eyebrow mb-3">Social & Professional Links</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {appData.spotify && <LinkField label="Spotify" url={appData.spotify} />}
                              {appData.instagram && <LinkField label="Instagram" url={appData.instagram} />}
                              {appData.soundcloud && <LinkField label="SoundCloud" url={appData.soundcloud} />}
                              {appData.youtube && <LinkField label="YouTube" url={appData.youtube} />}
                              {appData.otherLinks && <InfoField label="Other Links" value={appData.otherLinks} />}
                            </div>
                          </div>
                        )}

                        {/* ── Section 3: Rights Verification ── */}
                        {appData.soleCreator && (
                          <div>
                            <p className="label-eyebrow mb-3">Producer Rights Verification</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <RightsItem label="Sole creator & copyright owner" val={appData.soleCreator} />
                              <RightsItem label="Ever publicly shared tracks before" val={appData.everUploaded} invert />
                              <RightsItem label="Used AI-generated content" val={appData.usedAI} invert />
                              <RightsItem label="All samples commercially licensed" val={appData.samplesLicensed} />
                              <RightsItem label="Can provide project files/stems" val={appData.canProvideFiles} />
                              <RightsItem label="Understands anonymity obligation" val={appData.understandAnonymity} />
                              <RightsItem label="Has received copyright strikes" val={appData.copyrightStrikes} invert />
                              <RightsItem label="Acknowledges fraud consequences" val={appData.acknowledgeFraud} />
                              <RightsItem label="Can deliver label-quality work" val={appData.labelQuality} />
                            </div>
                            {appData.everUploadedDetails && (
                              <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
                                <strong>Shared before details:</strong> {appData.everUploadedDetails}
                              </div>
                            )}
                            {appData.usedAIDetails && (
                              <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800">
                                <strong>AI usage details:</strong> {appData.usedAIDetails}
                              </div>
                            )}
                            {appData.copyrightStrikesDetails && (
                              <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800">
                                <strong>Strike details:</strong> {appData.copyrightStrikesDetails}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── Section 4: Why Join ── */}
                        {appData.whyJoin && (
                          <div>
                            <p className="label-eyebrow mb-2">Why Join GhostBus</p>
                            <p className="text-foreground/80 leading-relaxed text-xs bg-card border border-border rounded-xl p-3 max-w-3xl">
                              {appData.whyJoin}
                            </p>
                          </div>
                        )}

                        {/* ── Section 5: Track Submissions ── */}
                        {appData.tracks && appData.tracks.length > 0 && (
                          <div>
                            <p className="label-eyebrow mb-3">Track Submissions ({appData.tracks.length})</p>
                            <div className="space-y-2">
                              {appData.tracks.map((t: any, i: number) => (
                                <div key={i} className="p-3 rounded-xl border border-border bg-card">
                                  <div className="flex items-center gap-4 flex-wrap">
                                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center shrink-0">{i + 1}</span>
                                    <span className="font-semibold text-sm flex-1 min-w-0">{t.title || '—'}</span>
                                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">{t.genre}</span>
                                    <span className="text-xs text-muted-foreground">{t.bpm} BPM</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.projectFile === 'YES' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                                      Project file: {t.projectFile}
                                    </span>
                                    {t.streamingLink && (
                                      <a href={t.streamingLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-medium">
                                        ▶ Preview
                                      </a>
                                    )}
                                    {t.downloadLink && (
                                      <a href={t.downloadLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-medium">
                                        ⬇ Download
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── Section 6: Digital Signature ── */}
                        {appData.signature && (
                          <div>
                            <p className="label-eyebrow mb-3">Digital Signature</p>
                            <div className="inline-block border border-border rounded-xl bg-white p-3">
                              <img
                                src={appData.signature}
                                alt="Applicant digital signature"
                                className="h-24 w-auto object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  if (!value || value === '-') return null;
  return (
    <div className="min-w-0">
      <span className="label-eyebrow block mb-0.5">{label}</span>
      <span className="text-foreground/80 text-xs break-words">{value}</span>
    </div>
  );
}

function LinkField({ label, url }: { label: string; url: string }) {
  return (
    <div className="min-w-0">
      <span className="label-eyebrow block mb-0.5">{label}</span>
      <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs truncate block">
        {url}
      </a>
    </div>
  );
}

function RightsItem({ label, val, invert = false }: { label: string; val: string; invert?: boolean }) {
  if (!val) return null;
  const isGood = invert ? val === 'NO' : val === 'YES';
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${isGood ? 'bg-green-50 border-green-200 text-green-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
      <span className="font-bold">{isGood ? '✓' : '✗'}</span>
      <span className="flex-1">{label}</span>
      <strong>{val}</strong>
    </div>
  );
}

export const Route = createFileRoute("/admin/seller-applications")({ component: SellerApplicationsPage });
