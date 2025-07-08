import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TreatmentType, AccessibilityNeed } from "@/lib/types";
import { PracticePin } from "@/components/PracticePin";
import { PracticeBottomSheet } from "@/components/PracticeBottomSheet";
import { BookingFlow } from "@/components/BookingFlow";
import { SuccessModal } from "@/components/SuccessModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [location, setLocation] = useState("Newcastle upon Tyne");

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

  // Mock practice positions for the map
  const practicePositions = [
    { top: "33%", left: "33%" },
    { top: "50%", right: "33%" },
    { bottom: "33%", left: "50%" },
  ];

  return (
    <div className="onboarding-step active">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-40">
        <div className="bg-white rounded-2xl shadow-gentle p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-search text-primary text-sm"></i>
            </div>
            <Input
              type="text"
              placeholder="Enter your location or postcode"
              className="flex-1 border-none shadow-none focus-visible:ring-0"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Button size="sm" variant="ghost" className="p-2 rounded-full hover:bg-primary/10">
              <i className="fas fa-location-arrow text-primary text-sm"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container h-screen relative">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-green-50"></div>
        
        {/* Practice Pins */}
        {!isLoading && practices.map((practice: Practice, index) => (
          <PracticePin
            key={practice.id}
            practice={practice}
            position={practicePositions[index] || { top: "50%", left: "50%" }}
            onClick={handlePracticeClick}
          />
        ))}
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
              <p className="text-text-soft">Finding nearby practices...</p>
            </div>
          </div>
        )}
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

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
