import React, { Suspense, useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { PasswordProtection } from "./components/PasswordProtection";
import NotFound from "./pages/not-found";

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
            <p className="text-red-600 mb-4">Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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

// Import components directly to avoid lazy loading issues
import Home from "./pages/Home";
import EarlyAccessForm from "./pages/EarlyAccessForm";
import DentistSignup from "./pages/DentistSignup";
import PatientSignup from "./pages/PatientSignup";
import DentistDashboard from "./pages/DentistDashboard";
import BookingStatusPage from "./pages/BookingStatusPage";
import Login from "./pages/Login";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SecurityTest from "./pages/SecurityTest";
import { AuthGuard } from "./components/AuthGuard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/security-test" component={SecurityTest} />
      <Route path="/early-access" component={EarlyAccessForm} />
      <Route path="/dentist-signup" component={DentistSignup} />
      <Route path="/patient-signup" component={PatientSignup} />
      <Route path="/dentist-dashboard">
        <AuthGuard requiredUserType="dentist">
          <DentistDashboard />
        </AuthGuard>
      </Route>
      <Route path="/booking-status">
        <AuthGuard>
          <BookingStatusPage />
        </AuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = sessionStorage.getItem('dentconnect_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          {isAuthenticated ? (
            <Router />
          ) : (
            <PasswordProtection onAuthenticated={handleAuthenticated} />
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
