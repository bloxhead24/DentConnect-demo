import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";

// Import full demo with error boundary
import { useState, useEffect } from "react";
import { TreatmentType, AccessibilityNeed } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Users, MapPin, Clock, Shield, Star, Video } from "lucide-react";

// Error boundary component
function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error("App error:", error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  if (hasError) {
    return fallback;
  }

  return children;
}

// Safe Home component that loads incrementally
function SafeHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState("landing");

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const startDemo = () => {
    setCurrentStep("demo");
    // Redirect to external early access after a short delay
    setTimeout(() => {
      window.location.href = "https://dentconnect.replit.app/";
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-teal-800">Loading DentConnect...</h2>
        </div>
      </div>
    );
  }

  if (currentStep === "demo") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Starting Demo...
            </h2>
            <p className="text-gray-600 mb-6">
              Redirecting to the full interactive demo experience
            </p>
            <div className="animate-pulse">
              <div className="w-full bg-teal-200 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-teal-800 mb-4">
              DentConnect
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Real-time dental appointment marketplace
            </p>
            <Badge variant="secondary" className="mb-4">
              Interactive Demo
            </Badge>
          </div>

          {/* Main Demo Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Stethoscope className="w-6 h-6 text-teal-600" />
                Interactive Demo Experience
              </CardTitle>
              <CardDescription>
                Connect patients with available dental appointments instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-teal-50 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-teal-800">
                      For Patients
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    Find available appointments based on your needs and location
                  </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-800">
                      For Dentists
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    Fill last-minute cancellations and connect with new patients
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={startDemo}
                className="w-full md:w-auto px-8 py-3 text-lg"
                size="lg"
              >
                Start Interactive Demo
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Location-Based</h3>
                <p className="text-gray-600 text-sm">Find nearby dental practices</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Real-Time</h3>
                <p className="text-gray-600 text-sm">Live appointment availability</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Video className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Virtual Consultations</h3>
                <p className="text-gray-600 text-sm">£24.99 online consultations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Application Error</h1>
          <p className="text-red-600 mb-4">Something went wrong. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    }>
      <Switch>
        <Route path="/" component={SafeHome} />
        <Route path="/early-access">
          <div className="min-h-screen bg-teal-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-teal-800 mb-4">Early Access</h1>
              <p className="text-gray-600">Redirecting to signup...</p>
              <Button onClick={() => window.location.href = "https://dentconnect.replit.app/"}>
                Continue to Early Access
              </Button>
            </div>
          </div>
        </Route>
        <Route path="/dentist-signup">
          <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-800 mb-4">Dentist Signup</h1>
              <p className="text-gray-600">Redirecting to signup...</p>
              <Button onClick={() => window.location.href = "https://dentconnect.replit.app/"}>
                Continue to Dentist Signup
              </Button>
            </div>
          </div>
        </Route>
        <Route path="/dentist-dashboard">
          <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-800 mb-4">Dentist Dashboard</h1>
              <p className="text-gray-600">Redirecting to dashboard...</p>
              <Button onClick={() => window.location.href = "https://dentconnect.replit.app/"}>
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
