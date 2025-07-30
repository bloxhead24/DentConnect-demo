import { useState } from "react";
import { TreatmentType, AccessibilityNeed } from "../lib/types";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import TreatmentSelection from "./TreatmentSelection";
import AccessibilityForm from "./AccessibilityForm";
import SearchModeSelection from "./SearchModeSelection";
import MapView from "./MapView";
import PracticeConnect from "./PracticeConnect";
import AuthenticatedDiary from "./AuthenticatedDiary";
import BudgetSelection from "./BudgetSelection";
import OpenSearchView from "./OpenSearchView";
import DentConnectLogo from "../components/DentConnectLogo";
import { DemoCompleteModal } from "../components/DemoCompleteModal";
import { VirtualConsultation } from "../components/VirtualConsultation";
import { BookingFlow } from "../components/BookingFlow";
import { BookingStatusHeader } from "../components/BookingStatusHeader";
import { RoyalCollegeBadge } from "../components/RoyalCollegeBadge";
import { Stethoscope, Users, MapPin, Clock, Shield, Star, Video, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "wouter";

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<"treatment" | "accessibility" | "searchmode" | "budget" | "practiceConnect" | "authenticatedDiary" | "map" | "openSearch">("treatment");
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | null>(null);
  const [selectedAccessibility, setSelectedAccessibility] = useState<AccessibilityNeed[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [selectedSearchMode, setSelectedSearchMode] = useState<"open" | "practice" | "mydentist" | null>(null);
  const [practiceTag, setPracticeTag] = useState<string>("");
  const [showDemoComplete, setShowDemoComplete] = useState(false);
  const [showVirtualConsultation, setShowVirtualConsultation] = useState(false);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedPractice, setSelectedPractice] = useState<any>(null);

  const handleTreatmentSelect = (treatment: TreatmentType) => {
    setSelectedTreatment(treatment);
    setCurrentStep("accessibility");
  };

  const handleAccessibilityComplete = (needs: AccessibilityNeed[]) => {
    setSelectedAccessibility(needs);
    setCurrentStep("searchmode");
  };

  const handleBudgetSelect = (budget: any) => {
    setSelectedBudget(budget);
    setCurrentStep("openSearch");
  };

  const handleSearchModeSelect = (mode: "open" | "practice" | "mydentist") => {
    setSelectedSearchMode(mode);
    // For open search, go to budget selection first
    if (mode === "open") {
      setCurrentStep("budget");
    } else if (mode === "practice" || mode === "mydentist") {
      // For practice and mydentist modes, skip budget and go to practice connect
      setCurrentStep("practiceConnect");
    } else {
      setCurrentStep("map");
    }
  };

  const handlePracticeConnect = (tag: string) => {
    setPracticeTag(tag);
    // Go directly to authenticated diary instead of map
    setCurrentStep("authenticatedDiary");
  };

  const handleDiaryBooking = async (appointment: any) => {
    // Handle booking from authenticated diary
    console.log("Booking appointment:", appointment);
    
    // Fetch practice data for the appointment
    try {
      const response = await fetch(`/api/practices/${appointment.practiceId}`);
      if (response.ok) {
        const practiceData = await response.json();
        setSelectedPractice(practiceData);
      }
    } catch (error) {
      console.error("Failed to fetch practice data:", error);
    }
    
    // Set the selected appointment and show booking flow
    setSelectedAppointment(appointment);
    setShowBookingFlow(true);
  };

  const handleBack = () => {
    if (currentStep === "accessibility") {
      setCurrentStep("treatment");
      setSelectedTreatment(null);
    } else if (currentStep === "searchmode") {
      setCurrentStep("accessibility");
    } else if (currentStep === "budget") {
      // Budget only appears after selecting "open" search mode
      setCurrentStep("searchmode");
    } else if (currentStep === "practiceConnect") {
      setCurrentStep("searchmode");
    } else if (currentStep === "authenticatedDiary") {
      setCurrentStep("practiceConnect");
    } else if (currentStep === "openSearch") {
      setCurrentStep("budget");
    } else if (currentStep === "map") {
      // If coming from practice connect, go back to it, otherwise to search mode
      if (selectedSearchMode === "practice" || selectedSearchMode === "mydentist") {
        setCurrentStep("practiceConnect");
      } else {
        setCurrentStep("searchmode");
      }
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Booking Status Header - Only show if user has bookings */}
      <BookingStatusHeader />
      
      {/* Unified Header */}
      <div className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/">
                <DentConnectLogo width={160} height={32} className="cursor-pointer" />
              </Link>
            </div>
            
            {/* Navigation Section */}
            <div className="flex items-center space-x-3">
              {/* Early Access Button - Always visible */}
              <Button 
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
                className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hidden md:flex items-center"
                size="sm"
              >
                <Star className="h-4 w-4 mr-2" />
                Early Access
              </Button>
              
              {!isAuthenticated ? (
                <>
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-primary border-primary hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Login</span>
                    </Button>
                  </Link>
                  <Link href="/dentist-signup">
                    <Button 
                      size="sm"
                      className="bg-primary text-white hover:bg-primary/90 transition-all duration-200"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Join as Dentist</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* User Info */}
                  <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </span>
                    {user?.userType === 'dentist' && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        Dentist
                      </Badge>
                    )}
                  </div>
                  
                  {/* Dentist Dashboard Link - Only show for dentists */}
                  {user?.userType === 'dentist' && (
                    <Link href="/dentist-dashboard">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-primary border-primary hover:bg-primary hover:text-white transition-all duration-200"
                      >
                        <Stethoscope className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Dashboard</span>
                      </Button>
                    </Link>
                  )}
                  
                  {/* Logout Button */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      {/* Progress Indicator for Mobile */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className={`flex items-center space-x-1 ${currentStep === "treatment" ? "text-primary font-medium" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${currentStep === "treatment" ? "bg-primary" : "bg-gray-300"}`}></div>
              <span>Treatment</span>
            </div>
            <div className={`flex items-center space-x-1 ${currentStep === "accessibility" ? "text-primary font-medium" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${currentStep === "accessibility" ? "bg-primary" : "bg-gray-300"}`}></div>
              <span>Preferences</span>
            </div>
            <div className={`flex items-center space-x-1 ${currentStep === "searchmode" ? "text-primary font-medium" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${currentStep === "searchmode" ? "bg-primary" : "bg-gray-300"}`}></div>
              <span>Search</span>
            </div>
            {/* Only show budget step if open search mode is selected */}
            {selectedSearchMode === "open" && (
              <div className={`flex items-center space-x-1 ${currentStep === "budget" ? "text-primary font-medium" : ""}`}>
                <div className={`w-2 h-2 rounded-full ${currentStep === "budget" ? "bg-primary" : "bg-gray-300"}`}></div>
                <span>Budget</span>
              </div>
            )}
            {/* Show connect step for practice/mydentist modes */}
            {(selectedSearchMode === "practice" || selectedSearchMode === "mydentist") && (
              <div className={`flex items-center space-x-1 ${currentStep === "practiceConnect" ? "text-primary font-medium" : ""}`}>
                <div className={`w-2 h-2 rounded-full ${currentStep === "practiceConnect" ? "bg-primary" : "bg-gray-300"}`}></div>
                <span>Connect</span>
              </div>
            )}
            <div className={`flex items-center space-x-1 ${(currentStep === "map" || currentStep === "openSearch" || currentStep === "authenticatedDiary") ? "text-primary font-medium" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${(currentStep === "map" || currentStep === "openSearch" || currentStep === "authenticatedDiary") ? "bg-primary" : "bg-gray-300"}`}></div>
              <span>Book</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {currentStep === "treatment" && (
          <TreatmentSelection 
            onTreatmentSelect={handleTreatmentSelect}
            selectedTreatment={selectedTreatment}
            onVirtualConsultation={() => setShowVirtualConsultation(true)}
          />
        )}
        
        {currentStep === "accessibility" && (
          <AccessibilityForm 
            onComplete={handleAccessibilityComplete}
            onBack={handleBack}
            selectedNeeds={selectedAccessibility}
          />
        )}

        {currentStep === "budget" && (
          <BudgetSelection
            selectedTreatment={selectedTreatment}
            selectedAccessibility={selectedAccessibility}
            onBudgetSelect={handleBudgetSelect}
            onBack={handleBack}
            selectedBudget={selectedBudget}
          />
        )}
        
        {currentStep === "searchmode" && (
          <SearchModeSelection 
            selectedTreatment={selectedTreatment}
            selectedAccessibility={selectedAccessibility}
            selectedBudget={selectedBudget}
            onSearchModeSelect={handleSearchModeSelect}
            onBack={handleBack}
          />
        )}

        {currentStep === "practiceConnect" && selectedSearchMode && (selectedSearchMode === "practice" || selectedSearchMode === "mydentist") && (
          <PracticeConnect
            selectedTreatment={selectedTreatment}
            selectedAccessibility={selectedAccessibility}
            searchMode={selectedSearchMode}
            onBack={handleBack}
            onConnect={handlePracticeConnect}
          />
        )}

        {currentStep === "authenticatedDiary" && (
          <AuthenticatedDiary
            onBack={handleBack}
            onBookAppointment={handleDiaryBooking}
          />
        )}
        
        {currentStep === "openSearch" && (
          <OpenSearchView
            selectedTreatment={selectedTreatment}
            selectedAccessibility={selectedAccessibility}
            selectedBudget={selectedBudget}
            onBack={handleBack}
            onBookingComplete={() => setShowDemoComplete(true)}
          />
        )}

        {currentStep === "map" && (
          <MapView 
            selectedTreatment={selectedTreatment}
            selectedAccessibility={selectedAccessibility}
            selectedSearchMode={selectedSearchMode || "open"}
            onBack={handleBack}
          />
        )}
      </div>

      {/* Virtual Consultation Modal */}
      <VirtualConsultation
        isOpen={showVirtualConsultation}
        onClose={() => setShowVirtualConsultation(false)}
        userType="patient"
        onSuccess={() => setShowDemoComplete(true)}
      />

      {/* Booking Flow Modal */}
      <BookingFlow
        practice={selectedPractice}
        appointment={selectedAppointment}
        isOpen={showBookingFlow}
        onClose={() => setShowBookingFlow(false)}
        onSuccess={() => {
          setShowBookingFlow(false);
          setShowDemoComplete(true);
        }}
      />

      {/* Demo Complete Modal */}
      <DemoCompleteModal
        isOpen={showDemoComplete}
        onClose={() => setShowDemoComplete(false)}
        demoType="patient"
      />

      {/* Royal College Badge */}
      <RoyalCollegeBadge />
    </div>
  );
}
