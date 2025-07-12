import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DiaryView } from "@/components/DiaryView";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { Practice, Dentist, Appointment } from "@shared/schema";

interface AuthenticatedDiaryProps {
  onBack: () => void;
  onBookAppointment: (appointment: Appointment) => void;
}

export default function AuthenticatedDiary({ onBack, onBookAppointment }: AuthenticatedDiaryProps) {
  const [showFullDiary, setShowFullDiary] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  
  const practiceTag = sessionStorage.getItem('authenticatedPracticeTag');
  const searchMode = sessionStorage.getItem('searchMode') as "practice" | "mydentist";

  const { data: practices = [] } = useQuery<Practice[]>({
    queryKey: ["/api/practices"],
  });

  const { data: dentists = [] } = useQuery<Dentist[]>({
    queryKey: ["/api/dentists"],
  });

  useEffect(() => {
    if (practices.length > 0 && practiceTag) {
      // Map practice tags to actual practices - same tag works for both modes
      const practice = practices.find(p => 
        practiceTag === "DEMO" ? p.id === 1 : 
        practiceTag === "NDC2024" ? p.id === 1 :
        practiceTag === "SMILE123" ? p.id === 2 :
        practiceTag === "DENTAL456" ? p.id === 3 :
        practiceTag === "TEST" ? p.id === 1 :
        p.id === 1
      );
      
      if (practice) {
        setSelectedPractice(practice);
        
        // For mydentist mode, the same tag identifies a specific dentist at that practice
        if (searchMode === "mydentist" && dentists.length > 0) {
          // Map practice tag to specific dentist (in real app, tag would encode both practice and dentist)
          const personalDentist = dentists.find(d => 
            d.practiceId === practice.id && 
            (practiceTag === "DEMO" || practiceTag === "NDC2024" ? d.id === 1 :
             practiceTag === "SMILE123" ? d.id === 2 :
             practiceTag === "DENTAL456" ? d.id === 3 :
             practiceTag === "TEST" ? d.id === 1 :
             d.id === 1)
          );
          setSelectedDentist(personalDentist || null);
        }
      }
    }
  }, [practices, dentists, practiceTag, searchMode]);

  const getQuickestAppointment = () => {
    // Return earliest available appointment based on search mode
    if (searchMode === "mydentist" && selectedDentist) {
      // For mydentist mode, return earliest appointment with the specific dentist
      return {
        id: 1,
        practiceId: selectedPractice?.id || 1,
        dentistId: selectedDentist.id,
        appointmentDate: new Date().toISOString(),
        appointmentTime: "09:00",
        duration: 30,
        treatmentType: "check-up",
        isAvailable: true,
        price: 85
      } as Appointment;
    } else {
      // For practice mode, return earliest appointment with any dentist at the practice
      return {
        id: 1,
        practiceId: selectedPractice?.id || 1,
        dentistId: 1, // Any available dentist
        appointmentDate: new Date().toISOString(),
        appointmentTime: "09:00",
        duration: 30,
        treatmentType: "check-up",
        isAvailable: true,
        price: 85
      } as Appointment;
    }
  };

  const quickestAppointment = getQuickestAppointment();

  const getBudgetSymbols = (price: number) => {
    if (price < 80) return "£";
    if (price < 120) return "££";
    if (price < 180) return "£££";
    return "££££";
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
              ? `Connected to Dr. ${selectedDentist.firstName} ${selectedDentist.lastName}` 
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
                    ? `With Dr. ${selectedDentist.firstName} ${selectedDentist.lastName}` 
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
                        {format(new Date(quickestAppointment.appointmentDate), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-600">
                        {quickestAppointment.appointmentTime}
                      </div>
                    </div>
                  </div>
                  {searchMode === "mydentist" && selectedDentist && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <i className="fas fa-user-md"></i>
                      <span>Dr. {selectedDentist.firstName} {selectedDentist.lastName}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-primary">{getBudgetSymbols(quickestAppointment.price)}</div>
                  <div className="text-xs text-gray-500">{quickestAppointment.duration} min</div>
                </div>
              </div>
              
              <Button
                onClick={() => onBookAppointment(quickestAppointment)}
                className={cn(
                  "w-full py-3 text-lg font-semibold",
                  searchMode === "mydentist" 
                    ? "bg-teal-600 hover:bg-teal-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <i className="fas fa-bolt mr-3"></i>
                Book This Appointment
              </Button>
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
            ? `View Dr. ${selectedDentist.firstName} ${selectedDentist.lastName}'s Diary`
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