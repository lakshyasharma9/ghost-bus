import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TRACKS, GENRES, GENRE_SLUGS, GENRE_SEO } from "@/lib/mock-data";
import { getGenreContent } from "@/lib/genre-content";
import { TrackCard } from "@/components/tracks/TrackCard";
import { TrackListRow } from "@/components/tracks/TrackListRow";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Build reverse map: slug → genre name
const SLUG_TO_GENRE: Record<string, string> = Object.fromEntries(
  Object.entries(GENRE_SLUGS).map(([genre, slug]) => [slug, genre])
);

export const Route = createFileRoute("/genres/$slug")({
  loader: ({ params }) => {
    const genre = SLUG_TO_GENRE[params.slug];
    if (!genre) throw notFound();
    return { genre, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const seo = GENRE_SEO[loaderData.genre];
    const content = getGenreContent(loaderData.genre);
    return {
      meta: [
        { title: `${content?.pageTitle ?? seo?.title ?? loaderData.genre} — GhostBus` },
        { name: "description", content: seo?.description ?? `Buy exclusive ${loaderData.genre} ghost produced tracks with full rights transfer on GhostBus.` },
        { name: "keywords", content: seo?.keyword ?? `${loaderData.genre} ghost production` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-app py-32 text-center">
      <h1 className="text-2xl font-semibold">Genre not found</h1>
      <Link to="/tracks" className="mt-4 inline-block text-primary">Browse all tracks →</Link>
    </div>
  ),
  component: GenrePage,
});

function GenrePage() {
  const { genre } = Route.useLoaderData();
  const seo = GENRE_SEO[genre];
  const content = getGenreContent(genre);
  const [view, setView] = useState<"grid" | "list">("list");

  // Fetch real tracks from API for this genre
  const { data: apiTracks } = useQuery({
    queryKey: ["genre-tracks", genre],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/tracks?genre=${encodeURIComponent(genre)}&limit=50`
        );
        if (!res.ok) return [];
        const json = await res.json();
        return (json.data?.tracks ?? []).map((t: any) => ({
          id: t.id,
          title: t.title,
          label: t.seller?.fullName || t.seller?.username || 'GhostBus',
          producer: t.seller?.fullName || t.seller?.username || 'Unknown',
          genre: t.genre,
          bpm: t.bpm || 128,
          musicalKey: t.key || 'C maj',
          duration: '5:00',
          price: t.price,
          artwork: t.coverUrl || '',
          audioUrl: t.previewUrl || '',
          sold: t.sold || false,
          hot: false,
          original: true,
          tags: t.tags || [],
          description: '',
          seller: t.seller,
          sellerUsername: t.seller?.username || t.seller?.id,
        }));
      } catch { return []; }
    },
    staleTime: 30_000,
  });

  // Combine real API tracks with mock tracks for this genre
  const mockTracks = useMemo(() => TRACKS.filter((t) => t.genre === genre && !t.sold), [genre]);
  const allMockTracks = useMemo(() => TRACKS.filter((t) => t.genre === genre), [genre]);
  const realTracks = apiTracks ?? [];
  const tracks = [...realTracks, ...mockTracks];
  const allTracks = [...realTracks, ...allMockTracks];

  return (
    <div className="container-app pt-12 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link to="/tracks" className="hover:text-foreground transition-colors">Tracks</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{genre}</span>
      </nav>

      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <div className="label-eyebrow mb-2">Genre</div>
            {/* Subtitle (part after colon) shown above in smaller font */}
            {(() => {
              const fullTitle = content?.pageTitle ?? seo?.title ?? genre;
              const colonIdx = fullTitle.indexOf(':');
              const mainTitle = colonIdx > -1 ? fullTitle.slice(0, colonIdx).trim() : fullTitle;
              const subtitle = colonIdx > -1 ? fullTitle.slice(colonIdx + 1).trim() : 'Buy Exclusive Tracks, Custom Beats & Ghost Production';
              return (
                <>
                  <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-2">
                    {mainTitle}
                  </h1>
                  <p className="text-base font-bold text-foreground/80 mb-4">{subtitle}</p>
                </>
              );
            })()}
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {seo?.description ?? `Exclusive ${genre} ghost produced tracks with full copyright transfer. One sale only.`}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>{tracks.length} available tracks</span>
              <span>·</span>
              <span>{allTracks.length} total in catalog</span>
            </div>
          </div>
          {tracks.length > 0 && (
            <div className="inline-flex p-1 rounded-full bg-muted text-sm">
              <button onClick={() => setView("grid")} className={`px-4 h-9 rounded-full transition ${view === "grid" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>Grid</button>
              <button onClick={() => setView("list")} className={`px-4 h-9 rounded-full transition ${view === "list" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>List</button>
            </div>
          )}
        </div>
      </div>

      {/* Track grid or list */}
      {tracks.length === 0 ? (
        <div className="py-16 text-center bg-card border border-border rounded-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 grid place-items-center mb-4 text-2xl">🎵</div>
          <h3 className="font-semibold text-lg mb-2">All {genre} tracks have been sold</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-5">
            {genre} is in very high demand. Check back soon or browse other available genres.
          </p>
          <Link to="/tracks" className="inline-flex h-10 px-5 items-center gap-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[--color-primary-hover] transition">
            Browse All Tracks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tracks.map((t) => <TrackCard key={t.id} track={t} queue={tracks} />)}
        </div>
      ) : (
        <div className="space-y-2.5">
          {tracks.map((t) => <TrackListRow key={t.id} track={t} queue={tracks} />)}
        </div>
      )}

      {/* Rich genre content */}
      {content ? (
        <GenreRichContent content={content} genre={genre} />
      ) : (
        <section className="mt-16 p-8 bg-card border border-border rounded-2xl">
          <h2 className="font-semibold text-xl mb-3">About {genre} Ghost Production on GhostBus</h2>
          <p className="text-foreground/80 leading-relaxed text-sm">
            GhostBus offers exclusive, professionally crafted {genre} tracks for DJs, artists, and record labels worldwide.
            Every {genre} track on our platform passes rigorous A&R review and MRT originality scanning before going live.
            Purchase includes full copyright transfer, mastered WAV files, individual stems, MIDI data, and all legal documentation.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/what-is-ghost-production" className="text-sm text-primary hover:underline">What Is Ghost Production?</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/buyer-protection" className="text-sm text-primary hover:underline">Buyer Protection</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/licensing-legal" className="text-sm text-primary hover:underline">Licensing &amp; Legal</Link>
          </div>
        </section>
      )}

      {/* Other genres */}
      <section className="mt-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">Explore Other Genres</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.filter((g) => g !== genre).map((g) => (
            <Link
              key={g}
              to={`/genres/${GENRE_SLUGS[g]}`}
              className="h-9 px-4 rounded-full border border-border bg-card text-sm font-medium hover:border-primary/40 hover:text-primary transition inline-flex items-center"
            >
              {g}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Rich content renderer ──────────────────────────────────────────────────────
function GenreRichContent({ content, genre }: { content: ReturnType<typeof getGenreContent>; genre: string }) {
  if (!content) return null;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mt-16 space-y-10">
      {/* Intro */}
      <section className="p-8 bg-card border border-border rounded-2xl">
        <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">{content.pageTitle}</h2>
        <p className="text-foreground/80 leading-relaxed">{content.intro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/what-is-ghost-production" className="text-sm text-primary hover:underline">What Is Ghost Production?</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/buyer-protection" className="text-sm text-primary hover:underline">Buyer Protection</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/licensing-legal" className="text-sm text-primary hover:underline">Licensing &amp; Legal</Link>
        </div>
      </section>

      {/* Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {content.sections.map((section, i) => (
          <div key={i} className={`p-7 bg-card border border-border rounded-2xl ${section.bullets && !section.body ? "" : ""}`}>
            <h3 className="font-semibold text-lg mb-3 text-foreground">{section.title}</h3>
            {section.body && (
              <div className="space-y-3">
                {section.body.split("\n\n").map((para, j) => (
                  <p key={j} className="text-sm text-foreground/75 leading-relaxed">{para}</p>
                ))}
              </div>
            )}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-3 space-y-2">
                {section.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground/75">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      {content.faq.length > 0 && (
        <section className="p-8 bg-card border border-border rounded-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">
            Frequently Asked Questions — {genre}
          </h2>
          <div className="space-y-3">
            {content.faq.map((item, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium hover:bg-muted/40 transition"
                >
                  <span>{item.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 pt-0 text-sm text-foreground/75 leading-relaxed border-t border-border bg-muted/20">
                    <p className="pt-4">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
