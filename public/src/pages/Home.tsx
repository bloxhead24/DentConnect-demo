import { useState } from "react";
import { TreatmentType, AccessibilityNeed } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TreatmentSelection from "./TreatmentSelection";
import AccessibilityForm from "./AccessibilityForm";
import SearchModeSelection from "./SearchModeSelection";
import MapView from "./MapView";
import PracticeConnect from "./PracticeConnect";
import AuthenticatedDiary from "./AuthenticatedDiary";
import BudgetSelection from "./BudgetSelection";
import OpenSearchView from "./OpenSearchView";
import DentConnectLogo from "@/components/DentConnectLogo";
import { DemoCompleteModal } from "@/components/DemoCompleteModal";
import { VirtualConsultation } from "@/components/VirtualConsultation";
import { Stethoscope, Users, MapPin, Clock, Shield, Star, Video } from "lucide-react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<"treatment" | "accessibility" | "searchmode" | "budget" | "practiceConnect" | "authenticatedDiary" | "map" | "openSearch">("treatment");
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | null>(null);
  const [selectedAccessibility, setSelectedAccessibility] = useState<AccessibilityNeed[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [selectedSearchMode, setSelectedSearchMode] = useState<"open" | "practice" | "mydentist" | null>(null);
  const [practiceTag, setPracticeTag] = useState<string>("");
  const [showDemoComplete, setShowDemoComplete] = useState(false);
  const [showVirtualConsultation, setShowVirtualConsultation] = useState(false);

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

  const handleDiaryBooking = (appointment: any) => {
    // Handle booking from authenticated diary
    console.log("Booking appointment:", appointment);
    // Show demo completion modal after booking
    setTimeout(() => {
      setShowDemoComplete(true);
    }, 2000);
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
      {/* Enhanced Mobile-First Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-primary/10 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <DentConnectLogo width={180} height={36} className="drop-shadow-sm" />
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/dentist-signup"}
                className="text-primary hover:bg-primary/10 transition-all duration-300 border-primary/20"
              >
                <Users className="h-4 w-4 mr-1" />
                Join as Dentist
              </Button>
              
              {/* Professional Early Access Button */}
              <Button 
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
                className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md border-0"
                size="sm"
              >
                <i className="fas fa-star mr-2"></i>
                Early Access
              </Button>
              
              <div className="flex items-center space-x-1">
                <button className="p-2 rounded-xl hover:bg-primary/10 transition-all duration-300 group relative">
                  <i className="fas fa-bell text-gray-600 group-hover:text-primary text-sm"></i>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
                </button>
                <button className="p-2 rounded-xl hover:bg-primary/10 transition-all duration-300 group">
                  <i className="fas fa-user text-gray-600 group-hover:text-primary text-sm"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* Royal College of Surgeons Badge */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-award text-white text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    🏆 Nominated for Innovation Award
                  </p>
                  <p className="text-xs text-blue-600">
                    Royal College of Surgeons - National Contribution to Dentistry 2024
                  </p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Indicator for Mobile */}
        <div className="px-4 pb-2">
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

        {currentStep === "practiceConnect" && selectedSearchMode && (
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
            selectedSearchMode={selectedSearchMode}
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

      {/* Demo Complete Modal */}
      <DemoCompleteModal
        isOpen={showDemoComplete}
        onClose={() => setShowDemoComplete(false)}
        demoType="patient"
      />
    </div>
  );
}
