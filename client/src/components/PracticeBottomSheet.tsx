import { useState } from "react";
import { Practice, Appointment, Dentist } from "@shared/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, Star, Languages, GraduationCap } from "lucide-react";
import { DiaryView } from "./DiaryView";

interface PracticeBottomSheetProps {
  practice: Practice | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (appointment: Appointment) => void;
  searchMode?: "open" | "practice" | "mydentist";
}

export function PracticeBottomSheet({ practice, isOpen, onClose, onBookAppointment, searchMode = "open" }: PracticeBottomSheetProps) {
  const [showDiary, setShowDiary] = useState(false);
  const { data: appointments = [] } = useQuery({
    queryKey: [`/api/appointments/${practice?.id}`],
    enabled: !!practice,
  });

  // Filter appointments based on search mode
  const filteredAppointments = appointments.filter(appointment => {
    if (searchMode === "mydentist") {
      // For "My Dentist" mode, show only appointments with a specific dentist
      // (In real implementation, this would filter by user's assigned dentist)
      return appointment.dentistId === 1; // Example: user's dentist ID
    } else if (searchMode === "practice") {
      // For "My Practice" mode, show appointments from any dentist in the practice
      return true; // All appointments in the practice
    } else {
      // For "Open" mode, show all available appointments
      return true;
    }
  });

  // Auto-select earliest appointment for "My Practice" and "My Dentist" modes
  const shouldAutoSelect = searchMode === "practice" || searchMode === "mydentist";
  const earliestAppointment = shouldAutoSelect && filteredAppointments.length > 0 
    ? filteredAppointments.sort((a, b) => {
        const dateA = a.appointmentDate ? new Date(a.appointmentDate).getTime() : 0;
        const dateB = b.appointmentDate ? new Date(b.appointmentDate).getTime() : 0;
        return dateA - dateB;
      })[0]
    : null;

  const handleQuickBook = () => {
    if (earliestAppointment) {
      onBookAppointment(earliestAppointment);
    }
  };

  const { data: dentists = [] } = useQuery<Dentist[]>({
    queryKey: [`/api/dentists/practice/${practice?.id}`],
    enabled: !!practice,
  });

  if (!practice) return null;

  const accessibilityFeatures = [
    { key: "wheelchairAccess", label: "Wheelchair Access", icon: "fas fa-wheelchair" },
    { key: "signLanguage", label: "BSL Available", icon: "fas fa-sign-language" },
    { key: "visualSupport", label: "Visual Support", icon: "fas fa-eye" },
    { key: "cognitiveSupport", label: "Cognitive Support", icon: "fas fa-brain" },
    { key: "disabledParking", label: "Disabled Parking", icon: "fas fa-parking" },
  ];

  const availableFeatures = accessibilityFeatures.filter(feature => practice[feature.key as keyof Practice]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <SheetTitle className="text-left">{practice.name}</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {practice.imageUrl && (
            <img 
              src={practice.imageUrl} 
              alt={practice.name}
              className="w-full h-48 object-cover rounded-2xl shadow-soft"
            />
          )}
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star text-sm ${i < Math.floor(practice.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({practice.rating})</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <i className="fas fa-map-marker-alt text-primary"></i>
              <span className="text-sm">{practice.address}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <i className="fas fa-clock text-primary"></i>
              <span className="text-sm">{practice.openingHours}</span>
            </div>
          </div>
          
          {availableFeatures.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Accessibility Features</h4>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map(feature => (
                  <Badge key={feature.key} variant="secondary" className="bg-primary/10 text-primary">
                    <i className={`${feature.icon} mr-1`}></i>
                    {feature.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Search Mode Specific Content */}
          {searchMode === "practice" && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900">My Practice - Next Available</h4>
                  <Badge className="bg-blue-600 text-white">
                    <i className="fas fa-building mr-1"></i>
                    Familiar Practice
                  </Badge>
                </div>
                {earliestAppointment ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-calendar text-blue-600"></i>
                        <div>
                          <div className="font-medium text-sm text-blue-900">
                            {earliestAppointment?.appointmentDate ? format(new Date(earliestAppointment.appointmentDate), 'MMM d, yyyy') : 'Date TBD'}
                          </div>
                          <div className="text-xs text-blue-700">
                            {earliestAppointment?.appointmentDate ? format(new Date(earliestAppointment.appointmentDate), 'h:mm a') : 'Time TBD'}
                          </div>
                        </div>
                      </div>
                      {earliestAppointment?.dentistId && (
                        <div className="flex items-center space-x-2 text-xs text-blue-700">
                          <i className="fas fa-user-md"></i>
                          <span>Dr. {dentists.find(d => d.id === earliestAppointment.dentistId)?.firstName} {dentists.find(d => d.id === earliestAppointment.dentistId)?.lastName}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleQuickBook}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <i className="fas fa-bolt mr-2"></i>
                      Quick Book
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-calendar-times text-3xl text-blue-400 mb-2"></i>
                    <p className="text-blue-700 font-medium">No immediate appointments available</p>
                    <p className="text-xs text-blue-600">Browse the full practice diary below</p>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 mb-2">Browse all practice appointments</p>
                <Button variant="outline" size="sm" onClick={() => setShowDiary(true)} className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  View Practice Diary
                </Button>
              </div>
            </div>
          )}

          {searchMode === "mydentist" && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-teal-50 to-green-50 p-4 rounded-xl border border-teal-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-teal-900">My Dentist - Next Available</h4>
                  <Badge className="bg-teal-600 text-white">
                    <i className="fas fa-user-md mr-1"></i>
                    Personal Dentist
                  </Badge>
                </div>
                {earliestAppointment ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-calendar text-teal-600"></i>
                        <div>
                          <div className="font-medium text-sm text-teal-900">
                            {earliestAppointment?.appointmentDate ? format(new Date(earliestAppointment.appointmentDate), 'MMM d, yyyy') : 'Date TBD'}
                          </div>
                          <div className="text-xs text-teal-700">
                            {earliestAppointment?.appointmentDate ? format(new Date(earliestAppointment.appointmentDate), 'h:mm a') : 'Time TBD'}
                          </div>
                        </div>
                      </div>
                      {earliestAppointment?.dentistId && (
                        <div className="flex items-center space-x-2 text-xs text-teal-700">
                          <i className="fas fa-user-md"></i>
                          <span>Dr. {dentists.find(d => d.id === earliestAppointment.dentistId)?.firstName} {dentists.find(d => d.id === earliestAppointment.dentistId)?.lastName}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleQuickBook}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <i className="fas fa-heart mr-2"></i>
                      Book with My Dentist
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-user-md text-3xl text-teal-400 mb-2"></i>
                    <p className="text-teal-700 font-medium">Your dentist has no immediate availability</p>
                    <p className="text-xs text-teal-600">Check their full diary for upcoming slots</p>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 mb-2">View your dentist's complete schedule</p>
                <Button variant="outline" size="sm" onClick={() => setShowDiary(true)} className="border-teal-300 text-teal-700 hover:bg-teal-50">
                  <i className="fas fa-calendar-week mr-2"></i>
                  Open My Dentist's Diary
                </Button>
              </div>
            </div>
          )}

          {/* Standard Appointments List for Open Search or as fallback */}
          {(searchMode === "open" || (!earliestAppointment && filteredAppointments.length > 0)) && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                {searchMode === "open" ? "Available Today" : "All Available Appointments"}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {filteredAppointments.map((appointment: Appointment) => (
                  <Button
                    key={appointment.id}
                    variant="outline"
                    className="p-3 h-auto bg-green-50 hover:bg-green-100 border-green-200"
                    onClick={() => onBookAppointment(appointment)}
                  >
                    <div className="text-center">
                      <div className="font-medium">{format(new Date(appointment.appointmentDate), 'h:mm a')}</div>
                      <div className="text-xs opacity-80">Available</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* No appointments message */}
          {filteredAppointments.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-calendar-times text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-600 mb-2">
                {searchMode === "mydentist" ? "No appointments available with your dentist" : "No appointments available"}
              </p>
              <p className="text-sm text-gray-500">
                {searchMode === "mydentist" ? "Try selecting a different search mode" : "Please try another practice or check back later"}
              </p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={onClose}>
              Select Time
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Diary View Modal */}
      {practice && showDiary && (
        <DiaryView
          practice={practice}
          dentist={searchMode === "mydentist" ? dentists.find(d => d.id === 1) : undefined}
          searchMode={searchMode === "practice" || searchMode === "mydentist" ? searchMode : "practice"}
          isOpen={showDiary}
          onClose={() => setShowDiary(false)}
          onBookAppointment={(appointment) => {
            setShowDiary(false);
            onBookAppointment(appointment);
          }}
        />
      )}
    </Sheet>
  );
}
