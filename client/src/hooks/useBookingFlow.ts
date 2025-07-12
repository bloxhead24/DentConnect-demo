import { useState } from "react";
import { BookingFormData } from "../lib/types";

export function useBookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    treatmentCategory: "",
    accessibilityNeeds: [],
    medications: false,
    allergies: false,
    lastDentalVisit: "",
    anxietyLevel: "comfortable",
  });

  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setFormData({
      treatmentCategory: "",
      accessibilityNeeds: [],
      medications: false,
      allergies: false,
      lastDentalVisit: "",
      anxietyLevel: "comfortable",
    });
  };

  return {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    resetFlow,
  };
}
