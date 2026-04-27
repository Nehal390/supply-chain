import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import MapView from "@/pages/map";
import Locations from "@/pages/locations";
import Inventory from "@/pages/inventory";
import Shortages from "@/pages/shortages";
import Products from "@/pages/products";
import Orders from "@/pages/orders";
import Alerts from "@/pages/alerts";
import Analytics from "@/pages/analytics";
import Assistant from "@/pages/assistant";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Redirect to="/login" />;
  
  return (
    <AppShell>
      <Component {...rest} />
    </AppShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/map"><ProtectedRoute component={MapView} /></Route>
      <Route path="/locations"><ProtectedRoute component={Locations} /></Route>
      <Route path="/inventory"><ProtectedRoute component={Inventory} /></Route>
      <Route path="/shortages"><ProtectedRoute component={Shortages} /></Route>
      <Route path="/products"><ProtectedRoute component={Products} /></Route>
      <Route path="/orders"><ProtectedRoute component={Orders} /></Route>
      <Route path="/alerts"><ProtectedRoute component={Alerts} /></Route>
      <Route path="/analytics"><ProtectedRoute component={Analytics} /></Route>
      <Route path="/assistant"><ProtectedRoute component={Assistant} /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
