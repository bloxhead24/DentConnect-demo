import { TreatmentType } from "@/lib/types";
import { TreatmentCard } from "@/components/TreatmentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";
import { EarlyAccessPopup } from "@/components/EarlyAccessPopup";
import { useState } from "react";

interface TreatmentSelectionProps {
  onTreatmentSelect: (treatment: TreatmentType) => void;
  selectedTreatment: TreatmentType | null;
  onVirtualConsultation?: () => void;
}

const treatmentTypes: TreatmentType[] = [
  {
    id: "emergency",
    name: "Emergency",
    category: "emergency",
    description: "Severe pain, trauma",
    icon: "fas fa-exclamation",
    color: "red",
  },
  {
    id: "urgent",
    name: "Urgent",
    category: "urgent", 
    description: "Filling, extraction",
    icon: "fas fa-clock",
    color: "orange",
  },
  {
    id: "routine",
    name: "Routine",
    category: "routine",
    description: "Cleaning, check-up",
    icon: "fas fa-calendar-check",
    color: "green",
  },
  {
    id: "cosmetic",
    name: "Cosmetic",
    category: "cosmetic",
    description: "Whitening, veneers",
    icon: "fas fa-smile",
    color: "blue",
  },
];

export default function TreatmentSelection({ onTreatmentSelect, selectedTreatment, onVirtualConsultation }: TreatmentSelectionProps) {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  
  const handleTreatmentSelect = (treatment: TreatmentType) => {
    onTreatmentSelect(treatment);
    // Show early access popup after treatment selection
    setTimeout(() => setShowEarlyAccess(true), 1000);
  };
  return (
    <div className="onboarding-step active">
      <div className="px-4 py-8 space-y-6">
        {/* Welcome Message with Enhanced Design */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <i className="fas fa-tooth text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">How can we help you today?</h2>
          <p className="text-gray-600 text-lg">Find the perfect dental appointment based on your needs</p>
        </div>

        {/* Treatment Type Selection with Enhanced Grid */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 text-center">What type of treatment do you need?</h3>
          <div className="grid grid-cols-2 gap-4">
            {treatmentTypes.map((treatment, index) => (
              <div 
                key={treatment.id}
                className="animate-in fade-in-50 slide-in-from-bottom-8 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TreatmentCard
                  treatment={treatment}
                  selected={selectedTreatment?.id === treatment.id}
                  onSelect={handleTreatmentSelect}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Virtual Consultation Option */}
        {onVirtualConsultation && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Virtual Consultation</h4>
                    <p className="text-sm text-gray-600">Get expert advice instantly</p>
                    <p className="text-sm font-medium text-blue-600">£24.99 (30 min)</p>
                  </div>
                </div>
                <Button 
                  onClick={onVirtualConsultation}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Start Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Divider */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Continue Button */}
        <div className="pt-2">
          <Button 
            className="floating-button w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-medium shadow-gentle"
            onClick={() => selectedTreatment && onTreatmentSelect(selectedTreatment)}
            disabled={!selectedTreatment}
          >
            Book In-Person Appointment
          </Button>
        </div>
      </div>
      
      {/* Early Access Popup */}
      <EarlyAccessPopup 
        isOpen={showEarlyAccess}
        onClose={() => setShowEarlyAccess(false)}
        trigger="questionnaire"
        title="Treatment Selected! 🦷"
        description="Perfect! Your treatment needs are noted. Get early access to book with matched dentists."
      />
    </div>
  );
}
