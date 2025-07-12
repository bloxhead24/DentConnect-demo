export interface AccessibilityNeed {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface TreatmentType {
  id: string;
  name: string;
  category: "emergency" | "urgent" | "routine" | "cosmetic";
  description: string;
  icon: string;
  color: string;
}

export interface BookingFormData {
  urgency?: "emergency" | "urgent" | "routine";
  treatmentCategory: string;
  accessibilityNeeds: string[];
  medications: boolean;
  allergies: boolean;
  lastDentalVisit: string;
  anxietyLevel: "comfortable" | "nervous" | "anxious";
  specialRequests?: string;
}

export interface AppointmentSlot {
  id: number;
  time: Date;
  available: boolean;
}
