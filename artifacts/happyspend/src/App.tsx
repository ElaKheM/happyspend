import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import pages and layout
import { AppLayout } from "@/components/layout";
import Auth from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Entries from "@/pages/entries";
import Summary from "@/pages/summary";
import Profile from "@/pages/profile";
import Habit from "@/pages/habit";
import SpendDnaReveal from "@/pages/spend-dna-reveal";
import NotFound from "@/pages/not-found";

// Patch window.fetch globally to append the auth token automatically for the generated Orval hooks
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [resource, config] = args;
  const token = localStorage.getItem('happyspend_token');

  if (token) {
    const headers = new Headers(config?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return originalFetch(resource, { ...(config ?? {}), headers });
  }
  return originalFetch(resource, config);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/" component={Dashboard} />
        <Route path="/history" component={Entries} />
        <Route path="/habit" component={Habit} />
        <Route path="/summary" component={Summary} />
        <Route path="/profile" component={Profile} />
        <Route path="/spend-dna" component={SpendDnaReveal} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
