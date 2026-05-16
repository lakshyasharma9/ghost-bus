import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
} from "@tanstack/react-router";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobalAudioPlayer } from "@/components/audio/GlobalAudioPlayer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScroll } from "@/components/SmoothScroll";

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
  
  // Hide header/footer on login page
  const isAuthPage = location.pathname === "/login";
  // Account pages have their own header
  const isAccountPage = location.pathname.startsWith("/account");
  
  const showNavbar = !isAuthPage && !isAccountPage;
  const showFooter = !isAuthPage && !isAccountPage;

  return (
    <QueryClientProvider client={queryClient}>
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
