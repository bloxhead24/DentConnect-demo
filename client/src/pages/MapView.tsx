import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TreatmentType, AccessibilityNeed } from "@/lib/types";
import { PracticePin } from "@/components/PracticePin";
import { PracticeBottomSheet } from "@/components/PracticeBottomSheet";
import { BookingFlow } from "@/components/BookingFlow";
import { SuccessModal } from "@/components/SuccessModal";
import { EnhancedMapSearch } from "@/components/EnhancedMapSearch";
import { SearchQuestionnaire, QuestionnaireData } from "@/components/SearchQuestionnaire";
import { MapLoadingState } from "@/components/MapLoadingState";
import { Button } from "@/components/ui/button";
import { Practice, Appointment } from "@shared/schema";

interface MapViewProps {
  selectedTreatment: TreatmentType | null;
  selectedAccessibility: AccessibilityNeed[];
  onBack: () => void;
}

export default function MapView({ selectedTreatment, selectedAccessibility, onBack }: MapViewProps) {
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPracticeSheet, setShowPracticeSheet] = useState(false);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [location, setLocation] = useState("Newcastle upon Tyne");
  const [searchFilters, setSearchFilters] = useState<{
    urgency?: string;
    anxietyLevel?: string;
    accessibilityNeeds?: string[];
  }>({});

  const { data: practices = [], isLoading } = useQuery({
    queryKey: ["/api/practices", { location }],
  });

  const handlePracticeClick = (practice: Practice) => {
    setSelectedPractice(practice);
    setShowPracticeSheet(true);
  };

  const handleBookAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPracticeSheet(false);
    setShowBookingFlow(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingFlow(false);
    setShowSuccess(true);
  };

  const handleQuestionnaireComplete = (data: QuestionnaireData) => {
    setQuestionnaireData(data);
    setSearchFilters({
      urgency: data.urgency,
      anxietyLevel: data.anxietyLevel,
      accessibilityNeeds: selectedAccessibility.map(need => need.name),
    });
    setShowQuestionnaire(false);
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
  };

  const handleFilterToggle = () => {
    // Future filter panel implementation
    console.log("Filter panel toggle");
  };

  // Northeast England practice positions based on actual locations
  const practicePositions = [
    { top: "25%", left: "45%" }, // Newcastle upon Tyne
    { top: "35%", left: "50%" }, // Gateshead
    { top: "45%", left: "40%" }, // Durham
    { top: "20%", left: "55%" }, // North Shields
    { top: "40%", left: "35%" }, // Consett
    { top: "50%", left: "45%" }, // Chester-le-Street
    { top: "30%", left: "40%" }, // Hexham
    { top: "60%", left: "50%" }, // Darlington
  ];

  return (
    <div className="onboarding-step active">
      {/* Enhanced Search Bar */}
      <EnhancedMapSearch
        onLocationChange={handleLocationChange}
        onFilterToggle={handleFilterToggle}
        onQuestionnaireOpen={() => setShowQuestionnaire(true)}
        searchFilters={searchFilters}
      />

      {/* Map Container */}
      <div className="map-container h-screen relative overflow-hidden">
        {/* Northeast England Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
          {/* Map Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-12 grid-rows-12 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-gray-200/50"></div>
              ))}
            </div>
          </div>
          
          {/* Geographic Features */}
          {/* River Tyne System */}
          <div className="absolute top-[25%] left-[30%] w-[40%] h-[3px] bg-gradient-to-r from-blue-300 to-blue-400 rounded-full transform rotate-12 shadow-sm"></div>
          <div className="absolute top-[26%] left-[45%] w-[25%] h-[3px] bg-gradient-to-r from-blue-300 to-blue-400 rounded-full transform rotate-6 shadow-sm"></div>
          
          {/* River Wear */}
          <div className="absolute top-[43%] left-[35%] w-[30%] h-[2px] bg-gradient-to-r from-blue-300 to-blue-400 rounded-full transform rotate-8 shadow-sm"></div>
          
          {/* River Tees */}
          <div className="absolute top-[58%] left-[40%] w-[35%] h-[2px] bg-gradient-to-r from-blue-300 to-blue-400 rounded-full transform rotate-3 shadow-sm"></div>
          
          {/* North Sea Coast */}
          <div className="absolute top-0 right-0 w-[15%] h-full bg-gradient-to-l from-blue-100 via-blue-50 to-transparent"></div>
          <div className="absolute top-[10%] right-[2%] w-[8%] h-[20%] bg-gradient-to-br from-blue-200/30 to-transparent rounded-full"></div>
          
          {/* Hadrian's Wall (stylized) */}
          <div className="absolute top-[35%] left-[10%] w-[60%] h-[2px] bg-gradient-to-r from-stone-400 to-stone-500 opacity-60 shadow-sm"></div>
          
          {/* Major Roads Network */}
          {/* A1 (Great North Road) */}
          <div className="absolute top-[20%] left-[40%] w-[2px] h-[60%] bg-gradient-to-b from-gray-400 to-gray-500 opacity-50 shadow-sm"></div>
          {/* A69 (Newcastle to Carlisle) */}
          <div className="absolute top-[30%] left-[15%] w-[50%] h-[2px] bg-gradient-to-r from-gray-400 to-gray-500 opacity-50 shadow-sm"></div>
          {/* A66 (Cross-Pennine) */}
          <div className="absolute top-[45%] left-[20%] w-[45%] h-[2px] bg-gradient-to-r from-gray-400 to-gray-500 opacity-50 shadow-sm"></div>
          {/* A19 (Tyne to Tees) */}
          <div className="absolute top-[25%] left-[50%] w-[2px] h-[40%] bg-gradient-to-b from-gray-400 to-gray-500 opacity-50 shadow-sm"></div>
          
          {/* City Areas */}
          <div className="absolute top-[22%] left-[42%] w-[8%] h-[8%] bg-primary/10 rounded-full"></div>
          <div className="absolute top-[33%] left-[47%] w-[6%] h-[6%] bg-primary/10 rounded-full"></div>
          <div className="absolute top-[43%] left-[37%] w-[7%] h-[7%] bg-primary/10 rounded-full"></div>
          
          {/* Place Labels */}
          <div className="absolute top-[18%] left-[38%] text-xs font-medium text-gray-600 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-gray-200/50 backdrop-blur-sm">
            Newcastle
          </div>
          <div className="absolute top-[30%] left-[52%] text-xs font-medium text-gray-600 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-gray-200/50 backdrop-blur-sm">
            Gateshead
          </div>
          <div className="absolute top-[40%] left-[32%] text-xs font-medium text-gray-600 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-gray-200/50 backdrop-blur-sm">
            Durham
          </div>
          <div className="absolute top-[17%] left-[52%] text-xs font-medium text-gray-600 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-gray-200/50 backdrop-blur-sm">
            North Shields
          </div>
          <div className="absolute top-[38%] left-[30%] text-xs font-medium text-gray-600 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-gray-200/50 backdrop-blur-sm">
            Consett
          </div>
          <div className="absolute top-[28%] left-[35%] text-xs font-medium text-gray-600 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-gray-200/50 backdrop-blur-sm">
            Hexham
          </div>
          <div className="absolute top-[57%] left-[47%] text-xs font-medium text-gray-600 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-gray-200/50 backdrop-blur-sm">
            Darlington
          </div>
        </div>
        
        {/* Practice Pins */}
        {!isLoading && practices.map((practice: Practice, index) => (
          <PracticePin
            key={practice.id}
            practice={practice}
            position={practicePositions[index] || { top: "50%", left: "50%" }}
            onClick={handlePracticeClick}
          />
        ))}
        
        {/* Enhanced Loading State */}
        <MapLoadingState isLoading={isLoading} searchQuery={location} />
      </div>

      {/* Filter Button */}
      <div className="absolute bottom-32 right-4 z-40">
        <Button
          size="icon"
          className="floating-button w-14 h-14 bg-white hover:bg-primary/10 rounded-full shadow-floating"
          variant="outline"
        >
          <i className="fas fa-filter text-primary"></i>
        </Button>
      </div>

      {/* List View Toggle */}
      <div className="absolute bottom-32 left-4 z-40">
        <Button
          size="icon"
          className="floating-button w-14 h-14 bg-white hover:bg-primary/10 rounded-full shadow-floating"
          variant="outline"
        >
          <i className="fas fa-list text-primary"></i>
        </Button>
      </div>

      {/* Back Button */}
      <div className="absolute top-20 left-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-white hover:bg-primary/10"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </Button>
      </div>

      {/* Practice Bottom Sheet */}
      <PracticeBottomSheet
        practice={selectedPractice}
        isOpen={showPracticeSheet}
        onClose={() => setShowPracticeSheet(false)}
        onBookAppointment={handleBookAppointment}
      />

      {/* Booking Flow */}
      <BookingFlow
        practice={selectedPractice}
        selectedAppointment={selectedAppointment}
        isOpen={showBookingFlow}
        onClose={() => setShowBookingFlow(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Search Questionnaire */}
      <SearchQuestionnaire
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        onComplete={handleQuestionnaireComplete}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
