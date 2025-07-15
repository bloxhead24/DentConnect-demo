import { useState } from "react";
import { Switch, Route } from "wouter";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { Stethoscope, Users, MapPin, Clock, Shield, Video, Calendar, Heart, Smile, Zap, Award } from "lucide-react";

// Simple logo component
function Logo() {
  return (
    <div className="flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg">
      <span className="text-2xl px-4 py-2">DentConnect</span>
    </div>
  );
}

// Treatment selection page
function TreatmentSelection() {
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);

  const treatments = [
    {
      id: "emergency",
      name: "Emergency Care",
      description: "Severe pain, trauma, or urgent dental issues",
      icon: <Zap className="w-8 h-8" />,
      color: "bg-red-500",
      urgency: "Immediate attention needed"
    },
    {
      id: "urgent",
      name: "Urgent Treatment",
      description: "Moderate pain or issues needing prompt care",
      icon: <Clock className="w-8 h-8" />,
      color: "bg-orange-500",
      urgency: "Within 24-48 hours"
    },
    {
      id: "routine",
      name: "Routine Care",
      description: "Regular checkups, cleanings, and preventive care",
      icon: <Shield className="w-8 h-8" />,
      color: "bg-green-500",
      urgency: "Within 1-2 weeks"
    },
    {
      id: "cosmetic",
      name: "Cosmetic Treatment",
      description: "Whitening, veneers, and aesthetic improvements",
      icon: <Smile className="w-8 h-8" />,
      color: "bg-purple-500",
      urgency: "Flexible timing"
    }
  ];

  const handleTreatmentSelect = (treatmentId: string) => {
    setSelectedTreatment(treatmentId);
    // Simulate booking completion
    setTimeout(() => {
      window.open('https://dentconnect.replit.app/', '_blank');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-4xl font-bold text-gray-900 mt-6 mb-4">
            What brings you here today?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your treatment type to find the best available appointment
          </p>
        </div>

        {/* Treatment Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {treatments.map((treatment) => (
            <Card 
              key={treatment.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                selectedTreatment === treatment.id ? 'ring-2 ring-teal-500' : ''
              }`}
              onClick={() => handleTreatmentSelect(treatment.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${treatment.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                  {treatment.icon}
                </div>
                <CardTitle className="text-xl">{treatment.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {treatment.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700">
                    Expected timeline: {treatment.urgency}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Virtual Consultation Option */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader className="text-center">
            <Video className="w-12 h-12 mx-auto mb-4" />
            <CardTitle className="text-2xl">Virtual Consultation</CardTitle>
            <CardDescription className="text-blue-100">
              Connect with a dental professional from home - £24.99 for 30 minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
            >
              <Video className="w-5 h-5 mr-2" />
              Start Virtual Consultation
            </Button>
          </CardContent>
        </Card>

        {/* Dentist CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Are you a dental professional?</p>
          <Button 
            variant="outline"
            className="border-teal-500 text-teal-600 hover:bg-teal-50"
            onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
          >
            <Stethoscope className="w-5 h-5 mr-2" />
            Join as Dentist
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simple 404 page
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Main App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/" component={TreatmentSelection} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;