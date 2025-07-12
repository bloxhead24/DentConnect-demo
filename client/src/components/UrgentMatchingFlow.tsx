import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import type { Practice, Appointment, Dentist, TreatmentType } from "../lib/types";

interface UrgentMatchingFlowProps {
  selectedTreatment: TreatmentType;
  isVisible: boolean;
  onMatchFound: (practice: Practice, appointment: Appointment, dentist: Dentist) => void;
  onNoMatchFound: () => void;
}

export function UrgentMatchingFlow({ selectedTreatment, isVisible, onMatchFound, onNoMatchFound }: UrgentMatchingFlowProps) {
  const [currentStep, setCurrentStep] = useState<"searching" | "found" | "notfound">("searching");
  const [matchedPractice, setMatchedPractice] = useState<Practice | null>(null);
  const [matchedAppointment, setMatchedAppointment] = useState<Appointment | null>(null);
  const [matchedDentist, setMatchedDentist] = useState<Dentist | null>(null);
  const [searchProgress, setSearchProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Simulate urgent appointment search
    setCurrentStep("searching");
    setSearchProgress(0);

    const searchInterval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(searchInterval);
          simulateMatchResult();
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(searchInterval);
  }, [isVisible]);

  const getBudgetSymbols = (price: number) => {
    if (price < 80) return "£";
    if (price < 120) return "££";
    if (price < 180) return "£££";
    return "££££";
  };

  const simulateMatchResult = () => {
    // Simulate finding an urgent appointment (80% success rate for demo)
    const hasMatch = Math.random() > 0.2;

    if (hasMatch) {
      // Mock urgent appointment data
      const urgentPractice: Practice = {
        id: 1,
        name: "Newcastle Emergency Dental",
        address: "15 Emergency Lane, Newcastle upon Tyne NE1 5XX",
        phone: "+44 191 234 5678",
        openingHours: "24/7 Emergency Services",
        rating: 4.9,
        image: "",
        latitude: 54.9783,
        longitude: -1.6174,
        accessibilityFeatures: ["wheelchair-access", "hearing-loop"],
        availableAppointments: []
      };

      const urgentDentist: Dentist = {
        id: 1,
        practiceId: 1,
        name: "Dr. Sarah Emergency",
        firstName: "Sarah",
        lastName: "Emergency",
        specialization: "Emergency Dentistry",
        experience: 15,
        rating: 4.9,
        image: "",
        availableHours: "24/7",
        bio: "Specialist in urgent dental care and emergency procedures."
      };

      const urgentAppointment: Appointment = {
        id: 1,
        practiceId: 1,
        dentistId: 1,
        appointmentDate: new Date().toISOString(),
        appointmentTime: "14:30",
        duration: 45,
        treatmentType: selectedTreatment.name,
        isAvailable: true,
        price: selectedTreatment.category === "emergency" ? 150 : 95,
        dateTime: new Date().toISOString(),
        userId: null
      };

      setMatchedPractice(urgentPractice);
      setMatchedDentist(urgentDentist);
      setMatchedAppointment(urgentAppointment);
      setCurrentStep("found");
    } else {
      setCurrentStep("notfound");
    }
  };

  const handleAcceptMatch = () => {
    if (matchedPractice && matchedAppointment && matchedDentist) {
      onMatchFound(matchedPractice, matchedAppointment, matchedDentist);
    }
  };

  const handleDeclineMatch = () => {
    onNoMatchFound();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        {currentStep === "searching" && (
          <>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-2xl text-orange-600 animate-pulse"></i>
              </div>
              <CardTitle className="text-xl">Finding Urgent Appointment</CardTitle>
              <p className="text-gray-600">Searching for immediate availability...</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Searching practices</span>
                    <span>{searchProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${searchProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check-circle text-green-500"></i>
                    <span>Checking emergency slots</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check-circle text-green-500"></i>
                    <span>Looking for cancellations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check-circle text-green-500"></i>
                    <span>Finding nearest practices</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === "found" && matchedPractice && matchedAppointment && matchedDentist && (
          <>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-2xl text-green-600"></i>
              </div>
              <CardTitle className="text-xl text-green-600">Urgent Slot Found!</CardTitle>
              <p className="text-gray-600">We found an immediate appointment</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{matchedPractice.name}</span>
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      {selectedTreatment.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-user-md text-green-600"></i>
                      <span>Dr. {matchedDentist.firstName} {matchedDentist.lastName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-clock text-green-600"></i>
                      <span>Today at {matchedAppointment.appointmentTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-map-marker-alt text-green-600"></i>
                      <span className="text-xs">{matchedPractice.address}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="font-semibold">Cost Level:</span>
                    <span className="font-bold text-lg text-primary">{getBudgetSymbols(matchedAppointment.price)}</span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    £5 booking fee + treatment costs assessed during appointment
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-exclamation-triangle text-yellow-600 mt-0.5"></i>
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Time-sensitive offer</p>
                      <p className="text-yellow-700">This slot must be confirmed within 5 minutes</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleDeclineMatch}
                    className="flex-1"
                  >
                    Keep Searching
                  </Button>
                  <Button 
                    onClick={handleAcceptMatch}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <i className="fas fa-check mr-2"></i>
                    Book This Slot
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === "notfound" && (
          <>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-times text-2xl text-red-600"></i>
              </div>
              <CardTitle className="text-xl text-red-600">No Immediate Slots</CardTitle>
              <p className="text-gray-600">No urgent appointments found right now</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-700">
                    We couldn't find any immediate appointments for {selectedTreatment.name}. 
                    You can still browse available appointments or try again in a few minutes.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleDeclineMatch}
                    className="w-full"
                    variant="outline"
                  >
                    <i className="fas fa-calendar mr-2"></i>
                    Browse All Appointments
                  </Button>
                  
                  <Button 
                    onClick={() => setCurrentStep("searching")}
                    className="w-full"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    Search Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}