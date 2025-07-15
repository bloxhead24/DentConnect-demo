import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { DiaryView } from "../components/DiaryView";
import { CallbackRequestModal } from "../components/CallbackRequestModal";
import { AppointmentStatusTracker } from "../components/AppointmentStatusTracker";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PhoneCall } from "lucide-react";
import type { Practice, Dentist, Appointment } from "@shared/schema";

interface AuthenticatedDiaryProps {
  onBack: () => void;
  onBookAppointment: (appointment: Appointment) => void;
  currentUserId?: number;
}

export default function AuthenticatedDiary({ onBack, onBookAppointment, currentUserId }: AuthenticatedDiaryProps) {
  const [showFullDiary, setShowFullDiary] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [showStatusTracker, setShowStatusTracker] = useState(false);
  
  const practiceTag = sessionStorage.getItem('authenticatedPracticeTag');
  const searchMode = sessionStorage.getItem('searchMode') as "practice" | "mydentist";
  const userId = currentUserId || parseInt(sessionStorage.getItem('currentUserId') || '0');

  // Query for practice by connection tag (includes appointments and dentists)
  const { data: practiceData } = useQuery<Practice & { availableAppointments: Appointment[], dentists: Dentist[] }>({
    queryKey: ["/api/practices/tag", practiceTag],
    enabled: !!practiceTag,
    queryFn: async () => {
      const response = await fetch(`/api/practices/tag/${practiceTag}`);
      if (!response.ok) throw new Error('Practice not found');
      return response.json();
    }
  });

  useEffect(() => {
    if (practiceData) {
      setSelectedPractice(practiceData);
      
      // For mydentist mode, select the first dentist at the practice
      if (searchMode === "mydentist" && practiceData.dentists?.length > 0) {
        setSelectedDentist(practiceData.dentists[0]);
      }
    }
  }, [practiceData, searchMode]);

  const getQuickestAppointment = () => {
    if (!practiceData?.availableAppointments?.length) return null;
    
    // Return earliest available appointment based on search mode
    if (searchMode === "mydentist" && selectedDentist) {
      // For mydentist mode, return earliest appointment with the specific dentist
      const dentistAppointments = practiceData.availableAppointments.filter(
        apt => apt.dentistId === selectedDentist.id
      );
      return dentistAppointments.length > 0 ? dentistAppointments[0] : null;
    } else {
      // For practice mode, return earliest appointment with any dentist at the practice
      return practiceData.availableAppointments[0];
    }
  };

  const quickestAppointment = getQuickestAppointment();

  const getBudgetSymbols = (treatmentType: string) => {
    // Show budget symbols based on treatment type
    if (treatmentType === "emergency") return "£££";
    if (treatmentType === "cosmetic") return "££££";
    if (treatmentType === "routine") return "££";
    return "£";
  };

  if (!selectedPractice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-lg text-gray-600">Connecting to your {searchMode === "mydentist" ? "dentist" : "practice"}...</p>
        </div>
      </div>
    );
  }

  if (showFullDiary) {
    return (
      <DiaryView
        practice={selectedPractice}
        dentist={selectedDentist}
        searchMode={searchMode}
        isOpen={true}
        onClose={() => setShowFullDiary(false)}
        onBookAppointment={onBookAppointment}
      />
    );
  }

  if (showStatusTracker && selectedPractice && userId) {
    return (
      <AppointmentStatusTracker
        userId={userId}
        practice={selectedPractice}
        onBack={() => setShowStatusTracker(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </Button>
          <h1 className="text-xl font-bold text-center">
            {searchMode === "mydentist" ? "My Dentist" : "My Practice"}
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Connection Success */}
        <div className="text-center">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
            searchMode === "mydentist" ? "bg-teal-100" : "bg-blue-100"
          )}>
            <i className={cn(
              "text-3xl",
              searchMode === "mydentist" ? "fas fa-user-md text-teal-600" : "fas fa-building text-blue-600"
            )}></i>
          </div>
          
          <Badge className={cn(
            "text-lg px-6 py-2 mb-3",
            searchMode === "mydentist" ? "bg-teal-600 text-white" : "bg-blue-600 text-white"
          )}>
            <i className="fas fa-check mr-2"></i>
            Connected to {practiceTag}
          </Badge>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPractice.name}</h2>
          <p className="text-gray-600">
            {searchMode === "mydentist" && selectedDentist
              ? `Connected to ${selectedDentist.name}` 
              : "All practice dentists available"
            }
          </p>
        </div>

        {/* Quick Appointment Option */}
        <Card className={cn(
          "border-2",
          searchMode === "mydentist" ? "border-teal-200 bg-gradient-to-r from-teal-50 to-green-50" : "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
        )}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                searchMode === "mydentist" ? "bg-teal-600" : "bg-blue-600"
              )}>
                <i className="fas fa-bolt text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold">Quick Book - Next Available</h3>
                <p className="text-sm font-normal text-gray-600">
                  {searchMode === "mydentist" && selectedDentist
                    ? `With ${selectedDentist.name}` 
                    : "Any available dentist at this practice"
                  }
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <i className={cn(
                      "fas fa-calendar",
                      searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                    )}></i>
                    <div>
                      <div className="font-medium text-sm">
                        {quickestAppointment ? format(new Date(quickestAppointment.appointmentDate), 'MMM d, yyyy') : 'No appointments'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {quickestAppointment ? quickestAppointment.appointmentTime : ''}
                      </div>
                    </div>
                  </div>
                  {searchMode === "mydentist" && selectedDentist && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <i className="fas fa-user-md"></i>
                      <span>{selectedDentist.name}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-primary">{quickestAppointment ? getBudgetSymbols(quickestAppointment.treatmentType) : ''}</div>
                  <div className="text-xs text-gray-500">{quickestAppointment ? quickestAppointment.duration : '0'} min</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => quickestAppointment && onBookAppointment(quickestAppointment)}
                  disabled={!quickestAppointment}
                  className={cn(
                    "w-full py-3 text-lg font-semibold",
                    searchMode === "mydentist" 
                      ? "bg-teal-600 hover:bg-teal-700" 
                      : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  <i className="fas fa-bolt mr-3"></i>
                  {quickestAppointment ? "Book This Appointment" : "No Appointments Available"}
                </Button>
                
                {/* Status Tracker Button */}
                {userId && (
                  <Button
                    onClick={() => setShowStatusTracker(true)}
                    variant="outline"
                    className={cn(
                      "w-full py-3 text-lg font-semibold border-2",
                      searchMode === "mydentist" 
                        ? "border-teal-600 text-teal-600 hover:bg-teal-50" 
                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    <i className="fas fa-clock mr-3"></i>
                    Check Booking Status
                  </Button>
                )}
                
                {/* Callback Request Button */}
                <CallbackRequestModal practiceId={selectedPractice.id} practiceName={selectedPractice.name}>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full py-3 text-lg font-semibold border-2",
                      searchMode === "mydentist" 
                        ? "border-teal-600 text-teal-600 hover:bg-teal-50" 
                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    <PhoneCall className="w-5 h-5 mr-3" />
                    Alert me of cancellations
                  </Button>
                </CallbackRequestModal>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Diary Access */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">Or browse all appointments</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFullDiary(true)}
          className={cn(
            "w-full py-3 border-2 border-dashed",
            searchMode === "mydentist" 
              ? "border-teal-300 text-teal-700 hover:bg-teal-50" 
              : "border-blue-300 text-blue-700 hover:bg-blue-50"
          )}
        >
          <i className="fas fa-calendar-alt mr-3"></i>
          {searchMode === "mydentist" && selectedDentist
            ? `View ${selectedDentist.name}'s Diary`
            : "View All Practice Dentists' Diaries"
          }
        </Button>

        {/* Practice Information */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="fas fa-map-marker-alt text-gray-600"></i>
                <span className="text-sm">{selectedPractice.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-phone text-gray-600"></i>
                <span className="text-sm">{selectedPractice.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-clock text-gray-600"></i>
                <span className="text-sm">{selectedPractice.openingHours}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}