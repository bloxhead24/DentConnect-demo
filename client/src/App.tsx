import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Lazy loading for performance
const Home = React.lazy(() => import("@/pages/Home"));
const EarlyAccessForm = React.lazy(() => import("@/pages/EarlyAccessForm"));
const DentistSignup = React.lazy(() => import("@/pages/DentistSignup"));
const DentistDashboard = React.lazy(() => import("@/pages/DentistDashboard"));

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading DentConnect...
          </h2>
          <p className="text-gray-600">
            Preparing your dental appointment marketplace
          </p>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/early-access" component={EarlyAccessForm} />
        <Route path="/dentist-signup" component={DentistSignup} />
        <Route path="/dentist-dashboard" component={DentistDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
