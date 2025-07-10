import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Clock, Star, Phone, Car, Brain, Map, Zap, Calendar } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import type { TreatmentType, AccessibilityNeed } from "@/lib/types";
import type { Practice, Appointment, Dentist } from "@shared/schema";
import { BookingFlow } from "@/components/BookingFlow";

interface OpenSearchViewProps {
  selectedTreatment: TreatmentType | null;
  selectedAccessibility: AccessibilityNeed[];
  selectedBudget?: any;
  onBack: () => void;
  onBookingComplete: () => void;
}

export default function OpenSearchView({ 
  selectedTreatment, 
  selectedAccessibility, 
  selectedBudget, 
  onBack, 
  onBookingComplete 
}: OpenSearchViewProps) {
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showAISearch, setShowAISearch] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [showAppointmentDiary, setShowAppointmentDiary] = useState<any>(null);

  // Mock data for practices with available appointments
  const mockPractices: (Practice & { availableAppointments: Appointment[]; dentists: Dentist[] })[] = [
    {
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
      availableAppointments: [
        {
          id: 1,
          practiceId: 1,
          dentistId: 1,
          appointmentDate: new Date().toISOString(),
          appointmentTime: "14:30",
          duration: 45,
          treatmentType: selectedTreatment?.name || "Emergency Care",
          isAvailable: true,
          price: selectedBudget?.id === "basic" ? 75 : selectedBudget?.id === "standard" ? 125 : selectedBudget?.id === "premium" ? 185 : 245,
          dateTime: new Date().toISOString(),
          userId: null
        },
        {
          id: 2,
          practiceId: 1,
          dentistId: 1,
          appointmentDate: addDays(new Date(), 1).toISOString(),
          appointmentTime: "09:00",
          duration: 30,
          treatmentType: selectedTreatment?.name || "Emergency Care",
          isAvailable: true,
          price: selectedBudget?.id === "basic" ? 65 : selectedBudget?.id === "standard" ? 95 : selectedBudget?.id === "premium" ? 155 : 195,
          dateTime: addDays(new Date(), 1).toISOString(),
          userId: null
        }
      ],
      dentists: [
        {
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
        }
      ]
    },
    {
      id: 2,
      name: "City Centre Dental",
      address: "42 High Street, Newcastle upon Tyne NE1 6LL",
      phone: "+44 191 345 6789",
      openingHours: "Mon-Fri 8:00-18:00, Sat 9:00-15:00",
      rating: 4.7,
      image: "",
      latitude: 54.9746,
      longitude: -1.6131,
      accessibilityFeatures: ["wheelchair-access"],
      availableAppointments: [
        {
          id: 3,
          practiceId: 2,
          dentistId: 2,
          appointmentDate: addDays(new Date(), 2).toISOString(),
          appointmentTime: "11:00",
          duration: 60,
          treatmentType: selectedTreatment?.name || "Treatment",
          isAvailable: true,
          price: selectedBudget?.id === "basic" ? 85 : selectedBudget?.id === "standard" ? 135 : selectedBudget?.id === "premium" ? 195 : 275,
          dateTime: addDays(new Date(), 2).toISOString(),
          userId: null
        }
      ],
      dentists: [
        {
          id: 2,
          practiceId: 2,
          name: "Dr. James Wilson",
          firstName: "James",
          lastName: "Wilson",
          specialization: "General Dentistry",
          experience: 12,
          rating: 4.7,
          image: "",
          availableHours: "Mon-Fri 8:00-18:00",
          bio: "Experienced general dentist with focus on patient comfort."
        }
      ]
    }
  ];

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const handleAppointmentSelect = (practice: Practice, appointment: Appointment, dentist: Dentist) => {
    setSelectedPractice(practice);
    setSelectedAppointment(appointment);
    setSelectedDentist(dentist);
    setShowBookingFlow(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingFlow(false);
    onBookingComplete();
  };

  const getBudgetSymbols = (price: number) => {
    if (price < 80) return "£";
    if (price < 120) return "££";
    if (price < 180) return "£££";
    return "££££";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold">Open Search</h1>
            <p className="text-sm text-gray-600">Available appointments</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Treatment & Budget Summary */}
        <Card className="mb-6 bg-gradient-to-r from-orange-100 to-red-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-bolt text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-orange-900">{selectedTreatment?.name || "Emergency Care"}</h3>
                  <div className="flex items-center space-x-4 text-sm text-orange-700">
                    <span>Budget: {selectedBudget?.symbols || "Any"}</span>
                    {selectedAccessibility.length > 0 && (
                      <span>• {selectedAccessibility.length} accessibility needs</span>
                    )}
                  </div>
                </div>
              </div>
              <Badge className="bg-orange-600 text-white">
                {selectedTreatment?.category || "urgent"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Smart Search Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50"
            onClick={() => setShowAISearch(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-1">AI Smart Search</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Let AI find the perfect appointment based on your preferences
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">Budget-aware</Badge>
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">Location-optimized</Badge>
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">Instant results</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Smart Match</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
            onClick={() => setShowMapView(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 mb-1">Interactive Map</h3>
                  <p className="text-sm text-green-700 mb-2">
                    Browse practices on a map and see real-time availability
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Visual search</Badge>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Distance-based</Badge>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Live updates</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Explore</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {viewMode === "list" ? (
          // List View
          <div className="space-y-6">
            {mockPractices.map((practice) => (
              <Card key={practice.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{practice.name}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{practice.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{practice.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Available Appointments</h4>
                    <div className="grid gap-3">
                      {practice.availableAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {format(new Date(appointment.appointmentDate), 'EEE')}
                              </div>
                              <div className="text-lg font-bold">
                                {format(new Date(appointment.appointmentDate), 'dd')}
                              </div>
                              <div className="text-xs text-gray-600">
                                {format(new Date(appointment.appointmentDate), 'MMM')}
                              </div>
                            </div>
                            
                            <div>
                              <div className="font-medium">{appointment.appointmentTime}</div>
                              <div className="text-sm text-gray-600">
                                {appointment.duration} minutes • Dr. {practice.dentists[0].firstName} {practice.dentists[0].lastName}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="font-bold text-lg">£{appointment.price}</div>
                                <div className="text-xs text-gray-600">{getBudgetSymbols(appointment.price)}</div>
                              </div>
                              <Button 
                                onClick={() => handleAppointmentSelect(practice, appointment, practice.dentists[0])}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Calendar View
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                >
                  Previous Week
                </Button>
                <span className="font-medium">
                  Week of {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                >
                  Next Week
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {getWeekDays(selectedDate).map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="font-medium mb-2">
                      {format(day, 'EEE dd/MM')}
                    </div>
                    <div className="space-y-2">
                      {mockPractices.map((practice) =>
                        practice.availableAppointments
                          .filter(apt => format(new Date(apt.appointmentDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                          .map((appointment) => (
                            <div
                              key={appointment.id}
                              className="p-2 bg-orange-100 rounded text-xs cursor-pointer hover:bg-orange-200 transition-colors"
                              onClick={() => handleAppointmentSelect(practice, appointment, practice.dentists[0])}
                            >
                              <div className="font-medium">{appointment.appointmentTime}</div>
                              <div className="text-gray-600">{practice.name}</div>
                              <div className="font-bold">£{appointment.price}</div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Options */}
        <Card className="mt-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900">Need immediate care?</h4>
                  <p className="text-sm text-red-700">Emergency appointments available within 2 hours</p>
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700">
                Find Emergency Slot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Flow Modal */}
      <BookingFlow
        practice={selectedPractice}
        appointment={selectedAppointment}
        dentist={selectedDentist}
        isOpen={showBookingFlow}
        onClose={() => setShowBookingFlow(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* AI Search Loading Modal */}
      <Dialog open={showAISearch} onOpenChange={setShowAISearch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">AI Smart Search</DialogTitle>
          </DialogHeader>
          <AISearchLoading 
            selectedTreatment={selectedTreatment}
            selectedBudget={selectedBudget}
            selectedAccessibility={selectedAccessibility}
            onComplete={(practice, appointment, dentist) => {
              setShowAISearch(false);
              handleAppointmentSelect(practice, appointment, dentist);
            }}
            onCancel={() => setShowAISearch(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Map View Loading Modal */}
      <Dialog open={showMapView} onOpenChange={setShowMapView}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Loading Map View</DialogTitle>
          </DialogHeader>
          <MapLoadingAnimation 
            onComplete={() => {
              setShowMapView(false);
              setShowInteractiveMap(true);
            }}
            onCancel={() => setShowMapView(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Interactive Map Modal */}
      <Dialog open={showInteractiveMap} onOpenChange={setShowInteractiveMap}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-center">Interactive Practice Map</DialogTitle>
          </DialogHeader>
          <InteractiveMapView 
            selectedTreatment={selectedTreatment}
            selectedBudget={selectedBudget}
            selectedAccessibility={selectedAccessibility}
            onAppointmentSelect={(practice, appointment, dentist) => {
              setShowInteractiveMap(false);
              handleAppointmentSelect(practice, appointment, dentist);
            }}
            onClose={() => setShowInteractiveMap(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Appointment Diary Modal */}
      <Dialog open={!!showAppointmentDiary} onOpenChange={() => setShowAppointmentDiary(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-center">
              {showAppointmentDiary?.name} - Available Appointments
            </DialogTitle>
          </DialogHeader>
          {showAppointmentDiary && (
            <AppointmentDiaryView
              practice={showAppointmentDiary}
              selectedTreatment={selectedTreatment}
              selectedBudget={selectedBudget}
              onAppointmentSelect={(appointment, dentist) => {
                setShowAppointmentDiary(null);
                onAppointmentSelect(showAppointmentDiary, appointment, dentist);
              }}
              onClose={() => setShowAppointmentDiary(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Appointment Diary View Component
function AppointmentDiaryView({
  practice,
  selectedTreatment,
  selectedBudget,
  onAppointmentSelect,
  onClose
}: {
  practice: any;
  selectedTreatment: TreatmentType | null;
  selectedBudget?: any;
  onAppointmentSelect: (appointment: Appointment, dentist: Dentist) => void;
  onClose: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate appointments for the next 14 days
  const generateAppointments = () => {
    const appointments = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i);
      const dayAppointments = [];
      
      // Generate 6-8 appointments per day
      const timeSlots = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '17:30'];
      const availableSlots = timeSlots.slice(0, Math.floor(Math.random() * 3) + 6);
      
      availableSlots.forEach((time, index) => {
        if (Math.random() > 0.3) { // 70% chance slot is available
          dayAppointments.push({
            id: i * 10 + index,
            practiceId: practice.id,
            dentistId: practice.dentist.id,
            appointmentDate: date.toISOString(),
            appointmentTime: time,
            duration: [30, 45, 60][Math.floor(Math.random() * 3)],
            treatmentType: selectedTreatment?.name || "Treatment",
            isAvailable: true,
            price: selectedBudget?.id === "basic" ? 
              75 + Math.floor(Math.random() * 25) : 
              selectedBudget?.id === "standard" ? 
              125 + Math.floor(Math.random() * 35) : 
              selectedBudget?.id === "premium" ? 
              185 + Math.floor(Math.random() * 45) : 
              245 + Math.floor(Math.random() * 55),
            dateTime: date.toISOString(),
            userId: null
          });
        }
      });
      
      if (dayAppointments.length > 0) {
        appointments.push({
          date,
          appointments: dayAppointments
        });
      }
    }
    return appointments;
  };

  const appointmentDays = generateAppointments();

  const getBudgetSymbols = (price: number) => {
    if (price < 80) return "£";
    if (price < 120) return "££";
    if (price < 180) return "£££";
    return "££££";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-bold">{practice.name}</h3>
          <p className="text-sm text-gray-600">Select an appointment time</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Appointments Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {appointmentDays.map((day, dayIndex) => (
            <div key={dayIndex} className="space-y-3">
              <h4 className="font-semibold text-lg sticky top-0 bg-white py-2">
                {format(day.date, 'EEEE, MMMM d, yyyy')}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {day.appointments.map((appointment) => (
                  <Card 
                    key={appointment.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-300"
                    onClick={() => onAppointmentSelect(appointment as Appointment, practice.dentist as Dentist)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-lg">{appointment.appointmentTime}</div>
                        <Badge variant="outline">{appointment.duration} min</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div>Dr. {practice.dentist.firstName} {practice.dentist.lastName}</div>
                        <div>{appointment.treatmentType}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">£{appointment.price}</div>
                          <div className="text-xs text-gray-600">{getBudgetSymbols(appointment.price)}</div>
                        </div>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Fee Notice */}
      <div className="p-4 border-t bg-blue-50">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">£</span>
          </div>
          <p className="text-xs text-blue-700">
            <strong>Service Fee:</strong> A £5 booking fee will be charged after your appointment for using DentConnect's last-minute booking service.
          </p>
        </div>
      </div>
    </div>
  );
}

// AI Search Loading Component
function AISearchLoading({ 
  selectedTreatment, 
  selectedBudget, 
  selectedAccessibility, 
  onComplete, 
  onCancel 
}: {
  selectedTreatment: TreatmentType | null;
  selectedBudget?: any;
  selectedAccessibility: AccessibilityNeed[];
  onComplete: (practice: Practice, appointment: Appointment, dentist: Dentist) => void;
  onCancel: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Analyzing your preferences...");

  const steps = [
    "Analyzing your preferences...",
    "Processing budget requirements...",
    "Checking accessibility needs...",
    "Scanning practice availability...",
    "Optimizing appointment times...",
    "Finding perfect match..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          // Simulate finding a match
          setTimeout(() => {
            const mockPractice: Practice = {
              id: 1,
              name: "AI-Matched Dental Excellence",
              address: "Smart Plaza, Newcastle upon Tyne NE1 1AA",
              phone: "+44 191 555 0123",
              openingHours: "Mon-Fri 8:00-18:00",
              rating: 4.9,
              image: "",
              latitude: 54.9783,
              longitude: -1.6174,
              accessibilityFeatures: selectedAccessibility.map(need => need.id),
              availableAppointments: []
            };

            const mockDentist: Dentist = {
              id: 1,
              practiceId: 1,
              name: "Dr. Perfect Match",
              firstName: "Perfect",
              lastName: "Match",
              specialization: selectedTreatment?.name || "General Dentistry",
              experience: 12,
              rating: 4.9,
              image: "",
              availableHours: "Mon-Fri 8:00-18:00",
              bio: "AI-selected dentist optimized for your specific needs."
            };

            const mockAppointment: Appointment = {
              id: 1,
              practiceId: 1,
              dentistId: 1,
              appointmentDate: new Date().toISOString(),
              appointmentTime: "14:30",
              duration: 45,
              treatmentType: selectedTreatment?.name || "Treatment",
              isAvailable: true,
              price: selectedBudget?.id === "basic" ? 85 : selectedBudget?.id === "standard" ? 125 : selectedBudget?.id === "premium" ? 185 : 225,
              dateTime: new Date().toISOString(),
              userId: null
            };

            onComplete(mockPractice, mockAppointment, mockDentist);
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const currentIndex = steps.indexOf(prev);
        if (currentIndex < steps.length - 1) {
          return steps[currentIndex + 1];
        }
        return prev;
      });
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="text-center space-y-6 py-8">
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 bg-blue-100 rounded-full"></div>
        <div className="absolute inset-2 bg-blue-600 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="absolute inset-0 border-4 border-blue-300 rounded-full animate-spin" style={{
          borderTopColor: 'transparent',
          borderRightColor: 'transparent'
        }}></div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-blue-900 mb-2">Finding Your Perfect Match</h3>
        <p className="text-blue-700 text-sm mb-4">{currentStep}</p>
        
        <div className="w-full bg-blue-100 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
          </div>
        </div>
        
        <div className="text-xs text-blue-600">{Math.round(progress)}% complete</div>
      </div>

      <div className="space-y-2 text-sm text-blue-800">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <span>Budget: {selectedBudget?.symbols || "Any"}</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <span>Treatment: {selectedTreatment?.name || "General"}</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <span>Accessibility: {selectedAccessibility.length} requirements</span>
        </div>
      </div>

      <Button variant="outline" onClick={onCancel}>
        Cancel Search
      </Button>
    </div>
  );
}

// Map Loading Animation Component
function MapLoadingAnimation({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 10 + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="text-center space-y-6 py-8">
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 bg-green-100 rounded-full"></div>
        <div className="absolute inset-2 bg-green-600 rounded-full flex items-center justify-center">
          <Map className="w-8 h-8 text-white" />
        </div>
        <div className="absolute inset-0">
          <div className="w-full h-full border-4 border-green-300 rounded-full animate-ping"></div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-green-900 mb-2">Loading Interactive Map</h3>
        <p className="text-green-700 text-sm mb-4">Preparing practice locations and availability...</p>
        
        <div className="w-full bg-green-100 rounded-full h-3 mb-4">
          <div 
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="text-xs text-green-600">{Math.round(progress)}% loaded</div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs text-green-800">
        <div className="flex flex-col items-center space-y-1">
          <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
            <MapPin className="w-3 h-3 text-green-600" />
          </div>
          <span>Locating practices</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
            <Clock className="w-3 h-3 text-green-600" />
          </div>
          <span>Checking availability</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 text-green-600" />
          </div>
          <span>Loading reviews</span>
        </div>
      </div>

      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

// Interactive Map Component
function InteractiveMapView({
  selectedTreatment,
  selectedBudget,
  selectedAccessibility,
  onAppointmentSelect,
  onClose
}: {
  selectedTreatment: TreatmentType | null;
  selectedBudget?: any;
  selectedAccessibility: AccessibilityNeed[];
  onAppointmentSelect: (practice: Practice, appointment: Appointment, dentist: Dentist) => void;
  onClose: () => void;
}) {
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);

  // Northeast England practices with real coordinates
  const northeastPractices = [
    {
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
      position: { top: "25%", left: "45%" },
      dentist: {
        id: 1,
        name: "Dr. Sarah Emergency",
        firstName: "Sarah",
        lastName: "Emergency",
        specialization: "Emergency Dentistry",
        experience: 15,
        rating: 4.9
      },
      appointment: {
        id: 1,
        practiceId: 1,
        dentistId: 1,
        appointmentDate: new Date().toISOString(),
        appointmentTime: "14:30",
        duration: 45,
        treatmentType: selectedTreatment?.name || "Emergency Care",
        isAvailable: true,
        price: selectedBudget?.id === "basic" ? 75 : selectedBudget?.id === "standard" ? 125 : selectedBudget?.id === "premium" ? 185 : 245,
        dateTime: new Date().toISOString(),
        userId: null
      }
    },
    {
      id: 2,
      name: "Gateshead Family Dental",
      address: "42 High Street, Gateshead NE8 1LN",
      phone: "+44 191 345 6789",
      openingHours: "Mon-Fri 8:00-18:00, Sat 9:00-15:00",
      rating: 4.7,
      image: "",
      latitude: 54.9526,
      longitude: -1.6033,
      accessibilityFeatures: ["wheelchair-access"],
      position: { top: "35%", left: "48%" },
      dentist: {
        id: 2,
        name: "Dr. James Wilson",
        firstName: "James",
        lastName: "Wilson",
        specialization: "General Dentistry",
        experience: 12,
        rating: 4.7
      },
      appointment: {
        id: 2,
        practiceId: 2,
        dentistId: 2,
        appointmentDate: addDays(new Date(), 1).toISOString(),
        appointmentTime: "11:00",
        duration: 60,
        treatmentType: selectedTreatment?.name || "Treatment",
        isAvailable: true,
        price: selectedBudget?.id === "basic" ? 85 : selectedBudget?.id === "standard" ? 135 : selectedBudget?.id === "premium" ? 195 : 275,
        dateTime: addDays(new Date(), 1).toISOString(),
        userId: null
      }
    },
    {
      id: 3,
      name: "Durham Smile Centre",
      address: "28 Market Place, Durham DH1 3NJ",
      phone: "+44 191 456 7890",
      openingHours: "Mon-Fri 9:00-17:00",
      rating: 4.8,
      image: "",
      latitude: 54.7761,
      longitude: -1.5733,
      accessibilityFeatures: ["wheelchair-access", "parking"],
      position: { top: "55%", left: "42%" },
      dentist: {
        id: 3,
        name: "Dr. Emma Thompson",
        firstName: "Emma",
        lastName: "Thompson",
        specialization: "Cosmetic Dentistry",
        experience: 18,
        rating: 4.8
      },
      appointment: {
        id: 3,
        practiceId: 3,
        dentistId: 3,
        appointmentDate: addDays(new Date(), 2).toISOString(),
        appointmentTime: "15:00",
        duration: 90,
        treatmentType: selectedTreatment?.name || "Treatment",
        isAvailable: true,
        price: selectedBudget?.id === "basic" ? 120 : selectedBudget?.id === "standard" ? 180 : selectedBudget?.id === "premium" ? 250 : 350,
        dateTime: addDays(new Date(), 2).toISOString(),
        userId: null
      }
    },
    {
      id: 4,
      name: "North Shields Dental Care",
      address: "67 Front Street, North Shields NE30 4DX",
      phone: "+44 191 567 8901",
      openingHours: "Mon-Fri 8:30-17:30",
      rating: 4.6,
      image: "",
      latitude: 55.0178,
      longitude: -1.4398,
      accessibilityFeatures: ["wheelchair-access"],
      position: { top: "15%", left: "55%" },
      dentist: {
        id: 4,
        name: "Dr. Michael Brown",
        firstName: "Michael",
        lastName: "Brown",
        specialization: "Orthodontics",
        experience: 20,
        rating: 4.6
      },
      appointment: {
        id: 4,
        practiceId: 4,
        dentistId: 4,
        appointmentDate: addDays(new Date(), 3).toISOString(),
        appointmentTime: "10:30",
        duration: 45,
        treatmentType: selectedTreatment?.name || "Treatment",
        isAvailable: true,
        price: selectedBudget?.id === "basic" ? 95 : selectedBudget?.id === "standard" ? 145 : selectedBudget?.id === "premium" ? 215 : 295,
        dateTime: addDays(new Date(), 3).toISOString(),
        userId: null
      }
    }
  ];

  const getBudgetSymbols = (price: number) => {
    if (price < 80) return "£";
    if (price < 120) return "££";
    if (price < 180) return "£££";
    return "££££";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Map Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-bold">Northeast England Practices</h3>
          <p className="text-sm text-gray-600">Click on a practice to view available appointments</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close Map
        </Button>
      </div>

      <div className="flex-1 flex">
        {/* Interactive OpenStreetMap Area */}
        <div className="flex-1 relative overflow-hidden">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=-2.2,54.6,-1.0,55.3&layer=mapnik&marker=54.9783,-1.6174`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            className="absolute inset-0"
            title="Northeast England Map"
          />
          
          {/* Custom Practice Markers Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {northeastPractices.map((practice) => {
              // Convert lat/lng to approximate pixel positions for overlay
              const leftPercent = ((practice.longitude + 2.2) / 1.2) * 100;
              const topPercent = ((55.3 - practice.latitude) / 0.7) * 100;
              
              return (
                <div
                  key={practice.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto z-10"
                  style={{ 
                    left: `${leftPercent}%`, 
                    top: `${topPercent}%` 
                  }}
                  onClick={() => setSelectedPractice(practice)}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-orange-600 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md text-xs font-medium opacity-0 hover:opacity-100 transition-opacity z-20">
                      {practice.name}
                    </div>
                    
                    {/* Pulsing animation for available practices */}
                    <div className="absolute inset-0 w-8 h-8 bg-orange-600 rounded-full animate-ping opacity-30"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Details Panel */}
        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          {selectedPractice ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{selectedPractice.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{selectedPractice.rating}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <span>{selectedPractice.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{selectedPractice.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{selectedPractice.openingHours}</span>
                </div>
              </div>

              {/* Next Available Appointment */}
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Next Available Appointment</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {format(new Date(selectedPractice.appointment.appointmentDate), 'EEEE, MMM d')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedPractice.appointment.appointmentTime} • {selectedPractice.appointment.duration} minutes
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">£{selectedPractice.appointment.price}</div>
                        <div className="text-xs text-gray-600">
                          {getBudgetSymbols(selectedPractice.appointment.price)}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Dentist:</strong> {selectedPractice.dentist.name}
                      </div>
                      <div className="text-sm text-gray-700 mb-3">
                        <strong>Specialization:</strong> {selectedPractice.dentist.specialization}
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => onAppointmentSelect(
                            selectedPractice as Practice,
                            selectedPractice.appointment as Appointment,
                            selectedPractice.dentist as Dentist
                          )}
                        >
                          Book This Appointment
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowAppointmentDiary(selectedPractice)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          View Full Diary
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Fee Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">£</span>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">
                      <strong>Service Fee:</strong> A £5 booking fee will be charged after your appointment for using DentConnect's last-minute booking service.
                    </p>
                  </div>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Demo Notice:</strong> This is a demonstration. Booking forms do not submit real data and no information is stored.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Click on a practice pin to view available appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}