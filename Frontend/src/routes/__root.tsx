import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobalAudioPlayer } from "@/components/audio/GlobalAudioPlayer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScroll } from "@/components/SmoothScroll";
import { GENRES, GENRE_SLUGS } from "@/lib/mock-data";

// JSON-LD Schema.org structured data — SEO rich snippets
const JSONLD_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.ghostbus.io/#organization",
      "name": "GHOSTBUS",
      "url": "https://www.ghostbus.io",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.ghostbus.io/assets/ghostbus-logo.svg"
      },
      "description": "Premium global ghost production marketplace for exclusive EDM and commercial music. Buy 100% royalty-free, release-ready tracks with full commercial rights and professional audio stem packages.",
      "sameAs": [
        "https://www.instagram.com/ghostbus",
        "https://www.youtube.com/@ghostbus"
      ],
      "areaServed": "Worldwide",
      "knowsAbout": [
        "Ghost Production", "EDM Production", "Tech House Production", "Techno Production",
        "Audio Engineering", "Music Licensing", "Mixing and Mastering"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.ghostbus.io/#website",
      "url": "https://www.ghostbus.io",
      "name": "GHOSTBUS",
      "publisher": { "@id": "https://www.ghostbus.io/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.ghostbus.io/tracks?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.ghostbus.io/#homepage",
      "url": "https://www.ghostbus.io",
      "name": "World's No. 1 Premium Ghost Production Marketplace",
      "isPartOf": { "@id": "https://www.ghostbus.io/#website" },
      "description": "Buy exclusive, release-ready ghost produced tracks from verified ghost producers. Multi-genre premium music production marketplace for DJs, artists, and record labels."
    },
    {
      "@type": "OfferCatalog",
      "@id": "https://www.ghostbus.io/#master-catalog",
      "name": "GHOSTBUS Premium Genre Catalog",
      "itemListElement": GENRES.map((genre) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `${genre} Ghost Production`,
          "url": `https://www.ghostbus.io/genres/${GENRE_SLUGS[genre]}`
        }
      }))
    },
    {
      "@type": "Product",
      "@id": "https://www.ghostbus.io/#featured-product-loop",
      "name": "Exclusive EDM Ghost Produced Tracks",
      "description": "Premium vetted royalty-free EDM tracks with full audio stems and commercial licensing rights.",
      "brand": { "@id": "https://www.ghostbus.io/#organization" },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "EUR",
        "lowPrice": "249",
        "highPrice": "1999",
        "offerCount": "500",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "bestRating": "5",
        "reviewCount": "1875"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.ghostbus.io/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is ghost production?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ghost production is a professional music production service where exclusive tracks are sold with full commercial rights and ownership transfer."
          }
        },
        {
          "@type": "Question",
          "name": "Are the tracks exclusive?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. All tracks on GHOSTBUS are sold exclusively — one sale only — with royalty-free commercial usage rights."
          }
        },
        {
          "@type": "Question",
          "name": "Can I release purchased tracks under my own artist name?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Buyers receive full commercial release rights and may release purchased music under their own artist identity."
          }
        },
        {
          "@type": "Question",
          "name": "What genres are available on GHOSTBUS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Genres include Tech House, Afro House, Melodic Techno, Techno, Pop, Hip-Hop, Reggaeton, Future House, Drum and Bass, and more."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.ghostbus.io/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ghostbus.io" }
      ]
    }
  ]
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex h-11 px-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[--color-primary-hover] transition-colors">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium"
          >
            Try again
          </button>
          <a href="/" className="h-10 px-4 inline-flex items-center rounded-full border border-border text-sm">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  const isAuthPage = location.pathname === "/login";
  const isAccountPage = location.pathname.startsWith("/account");

  const showNavbar = !isAuthPage && !isAccountPage;
  const showFooter = !isAuthPage && !isAccountPage;

  return (
    <QueryClientProvider client={queryClient}>
      {/* JSON-LD Schema.org — injected in head for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_SCHEMA) }}
      />
      <SmoothScroll>
        {showNavbar && <Navbar />}
        <main className="min-h-screen">
          <Outlet />
        </main>
        {showFooter && <Footer />}
        <CartDrawer />
        <GlobalAudioPlayer />
        <Toaster />
      </SmoothScroll>
    </QueryClientProvider>
  );
}
