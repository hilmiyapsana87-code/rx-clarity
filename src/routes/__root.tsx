import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { Menu, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/analyze", label: "Analyze" },
  { to: "/safety", label: "Safety" },
  { to: "/about", label: "About" },
] as const;

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
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
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
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "RxLens" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppChrome>
        <Outlet />
      </AppChrome>
    </QueryClientProvider>
  );
}

function AppChrome({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    return () => document.documentElement.classList.remove("high-contrast");
  }, [highContrast]);

  return (
    <div className="min-h-dvh bg-rxlens-page text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="RxLens home">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-clinical-gradient text-primary-foreground shadow-lens">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-bold tracking-normal text-foreground">
                RxLens
              </span>
              <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                Demo Mode
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <nav aria-label="Primary navigation" className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  activeProps={{ className: "bg-primary-soft text-primary" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Button
              type="button"
              variant={highContrast ? "default" : "clinical"}
              size="sm"
              onClick={() => setHighContrast((current) => !current)}
            >
              <ShieldCheck aria-hidden="true" />
              Accessibility
            </Button>
            <Button asChild variant="hero" size="lg">
              <Link to="/analyze">Analyze Prescription</Link>
            </Button>
          </div>

          <MobileNav highContrast={highContrast} onToggleContrast={() => setHighContrast((current) => !current)} />
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-background/80">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm text-muted-foreground sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 lg:px-8">
          <p className="max-w-2xl">
            RxLens is a prototype for educational prescription understanding. It does not diagnose, prescribe, or change treatment.
          </p>
          <Link to="/safety" className="font-semibold text-primary hover:underline">
            Review safety guidance
          </Link>
        </div>
      </footer>
    </div>
  );
}

function MobileNav({
  highContrast,
  onToggleContrast,
}: {
  highContrast: boolean;
  onToggleContrast: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <span className="rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
        Demo Mode
      </span>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Open navigation menu">
            <Menu aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(88vw,24rem)]">
          <SheetHeader>
            <SheetTitle>RxLens</SheetTitle>
            <SheetDescription>See your prescription clearly.</SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile navigation" className="mt-8 grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-3 text-base font-semibold text-foreground hover:bg-accent"
                activeProps={{ className: "bg-primary-soft text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <Button type="button" variant={highContrast ? "default" : "clinical"} onClick={onToggleContrast}>
              <ShieldCheck aria-hidden="true" />
              Accessibility
            </Button>
            <Button asChild variant="hero" size="lg">
              <Link to="/analyze">Analyze Prescription</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
