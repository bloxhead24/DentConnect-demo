import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Clock, AlertCircle, CheckCircle, XCircle, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { BookingFlow } from "@/components/BookingFlow";

interface DentalQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; urgency?: number }[];
}

const dentalQuestions: DentalQuestion[] = [
  {
    id: "pain-level",
    question: "How would you describe your current pain level?",
    options: [
      { value: "severe", label: "Severe pain (8-10/10)", urgency: 10 },
      { value: "moderate", label: "Moderate pain (5-7/10)", urgency: 7 },
      { value: "mild", label: "Mild discomfort (2-4/10)", urgency: 4 },
      { value: "none", label: "No pain, routine check", urgency: 1 }
    ]
  },
  {
    id: "issue-duration",
    question: "How long have you been experiencing this issue?",
    options: [
      { value: "today", label: "Started today", urgency: 8 },
      { value: "days", label: "A few days", urgency: 6 },
      { value: "week", label: "About a week", urgency: 4 },
      { value: "longer", label: "More than a week", urgency: 2 }
    ]
  },
  {
    id: "symptoms",
    question: "Which symptoms are you experiencing?",
    options: [
      { value: "swelling", label: "Swelling or abscess", urgency: 9 },
      { value: "bleeding", label: "Bleeding gums", urgency: 7 },
      { value: "sensitivity", label: "Sensitivity to hot/cold", urgency: 5 },
      { value: "cosmetic", label: "Cosmetic concern only", urgency: 2 }
    ]
  },
  {
    id: "mobility",
    question: "How far are you willing to travel?",
    options: [
      { value: "5km", label: "Up to 5km (10 min drive)" },
      { value: "10km", label: "Up to 10km (20 min drive)" },
      { value: "20km", label: "Up to 20km (30 min drive)" },
      { value: "any", label: "Any distance for urgent care" }
    ]
  }
];

interface OpenSearchFlowProps {
  onClose: () => void;
}

export function OpenSearchFlow({ onClose }: OpenSearchFlowProps) {
  const [currentStep, setCurrentStep] = useState<"loading" | "questions" | "searching" | "result" | "booking">("loading");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [searchProgress, setSearchProgress] = useState(0);
  const [matchedAppointment, setMatchedAppointment] = useState<any>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const { toast } = useToast();

  // Fetch real appointments from the API
  const { data: availableAppointments = [] } = useQuery({
    queryKey: ["/api/appointments/available/all"],
    enabled: currentStep === "searching"
  });

  useEffect(() => {
    // Initial loading animation
    if (currentStep === "loading") {
      setTimeout(() => {
        setCurrentStep("questions");
      }, 2000);
    }
  }, [currentStep]);

  useEffect(() => {
    // Searching animation with real appointments
    if (currentStep === "searching" && availableAppointments.length > 0) {
      const interval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            
            // Find the best matching appointment based on urgency and distance
            const urgencyScore = calculateUrgencyScore(answers);
            const bestAppointment = findBestAppointment(availableAppointments, urgencyScore);
            
            if (bestAppointment) {
              setMatchedAppointment(bestAppointment);
              setCurrentStep("result");
            } else {
              // No appointments found
              toast({
                title: "No appointments available",
                description: "Unfortunately, there are no appointments available at this time. Please try again later.",
                variant: "destructive"
              });
              onClose();
            }
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentStep, availableAppointments, answers, toast, onClose]);

  // Helper function to calculate urgency score
  const calculateUrgencyScore = (answers: Record<string, string>) => {
    let score = 0;
    if (answers["pain-level"] === "severe") score += 10;
    else if (answers["pain-level"] === "moderate") score += 7;
    else if (answers["pain-level"] === "mild") score += 4;
    
    if (answers["issue-duration"] === "today") score += 8;
    else if (answers["issue-duration"] === "days") score += 6;
    else if (answers["issue-duration"] === "week") score += 4;
    
    if (answers["symptoms"] === "swelling") score += 9;
    else if (answers["symptoms"] === "bleeding") score += 7;
    else if (answers["symptoms"] === "sensitivity") score += 5;
    
    return score;
  };

  // Helper function to find the best appointment
  const findBestAppointment = (appointments: any[], urgencyScore: number) => {
    if (!appointments || appointments.length === 0) return null;
    
    // Sort appointments by date/time (earliest first)
    const sortedAppointments = [...appointments].sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
      const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    // For high urgency, return the earliest appointment
    // For lower urgency, we could implement more complex matching logic
    const appointment = sortedAppointments[0];
    
    return {
      id: appointment.id,
      practice: appointment.practice || {
        name: "Unknown Practice",
        address: "Address not available"
      },
      dentist: appointment.dentist || {
        name: "Available Dentist",
        specialization: "General Dentistry"
      },
      appointment: {
        date: new Date(appointment.appointmentDate),
        time: appointment.appointmentTime,
        duration: appointment.duration || 30,
        type: appointment.treatment?.name || "Dental Consultation"
      },
      estimatedCost: "£5 booking fee (treatment cost assessed during appointment)"
    };
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [dentalQuestions[currentQuestionIndex].id]: value });
    
    if (currentQuestionIndex < dentalQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, start searching
      setCurrentStep("searching");
    }
  };

  const handleBookingDecision = (approved: boolean) => {
    if (approved && matchedAppointment) {
      // Show the booking flow to collect triage information
      setShowBookingFlow(true);
    } else {
      // Reset to show different options
      setCurrentStep("searching");
      setSearchProgress(0);
      toast({
        title: "Finding Alternative Options",
        description: "Searching for the next best available appointment...",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* Initial Loading */}
        {currentStep === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 mx-auto mb-6"
            >
              <Search className="w-full h-full text-teal-600" />
            </motion.div>
            <h2 className="text-2xl font-semibold mb-2">Activating Smart Search</h2>
            <p className="text-muted-foreground">Finding the fastest available appointment for you...</p>
          </motion.div>
        )}

        {/* Questions */}
        {currentStep === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Quick Assessment</h3>
                  <span className="text-sm text-muted-foreground">
                    {currentQuestionIndex + 1} of {dentalQuestions.length}
                  </span>
                </div>
                <Progress value={(currentQuestionIndex + 1) / dentalQuestions.length * 100} className="h-2" />
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-medium">
                  {dentalQuestions[currentQuestionIndex].question}
                </h4>
                
                <RadioGroup onValueChange={handleAnswer}>
                  {dentalQuestions[currentQuestionIndex].options.map((option) => (
                    <motion.div
                      key={option.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label 
                        htmlFor={option.value} 
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {option.label}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full mt-4"
              >
                Cancel Search
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Searching */}
        {currentStep === "searching" && (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center w-full max-w-md"
          >
            <Card className="p-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <MapPin className="w-full h-full text-teal-600" />
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2">Optimizing Your Match</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Analyzing {Math.floor(searchProgress / 10) + 1} practices near you...
              </p>
              
              <Progress value={searchProgress} className="h-3 mb-4" />
              
              <div className="text-xs text-muted-foreground space-y-1">
                {searchProgress < 30 && <p>✓ Checking emergency availability...</p>}
                {searchProgress >= 30 && searchProgress < 60 && <p>✓ Calculating travel times...</p>}
                {searchProgress >= 60 && searchProgress < 90 && <p>✓ Matching with specialists...</p>}
                {searchProgress >= 90 && <p>✓ Securing appointment slot...</p>}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Result */}
        {currentStep === "result" && matchedAppointment && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-8 h-8" />
                  <h3 className="text-xl font-semibold">Perfect Match Found!</h3>
                </div>
                <p className="text-teal-50">
                  Available at {matchedAppointment.appointment.time || format(matchedAppointment.appointment.date, "h:mm a")} • 
                  {matchedAppointment.practice.travelTime || "Nearby location"}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Practice Info */}
                <div>
                  <h4 className="font-semibold text-lg mb-3">{matchedAppointment.practice.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{matchedAppointment.practice.address}</span>
                    </div>
                    {(matchedAppointment.practice.distance || matchedAppointment.practice.travelTime) && (
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-muted-foreground" />
                        <span>{matchedAppointment.practice.distance} • {matchedAppointment.practice.travelTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dentist Info */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{matchedAppointment.dentist.name}</h5>
                      <p className="text-sm text-muted-foreground">{matchedAppointment.dentist.specialization}</p>
                      {matchedAppointment.dentist.experience && (
                        <p className="text-sm text-muted-foreground">{matchedAppointment.dentist.experience} experience</p>
                      )}
                    </div>
                    {matchedAppointment.dentist.rating && (
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">★ {matchedAppointment.dentist.rating}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="border-t pt-4">
                  <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Appointment Time:</span>
                      <span className="text-sm">{matchedAppointment.appointment.time} on {format(matchedAppointment.appointment.date, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Duration:</span>
                      <span className="text-sm">{matchedAppointment.appointment.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Estimated Cost:</span>
                      <span className="text-sm font-semibold">{matchedAppointment.estimatedCost}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleBookingDecision(true)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Book
                  </Button>
                  <Button
                    onClick={() => handleBookingDecision(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Find Alternative
                  </Button>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(matchedAppointment.practice.address)}`)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Practice
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Flow Modal */}
      {showBookingFlow && matchedAppointment && (
        <BookingFlow
          appointmentData={{
            id: matchedAppointment.id,
            practiceId: matchedAppointment.practice?.id || 1,
            dentistId: matchedAppointment.dentist?.id || 1,
            appointmentDate: matchedAppointment.appointment.date,
            appointmentTime: matchedAppointment.appointment.time,
            treatmentCategory: "emergency",
            practice: matchedAppointment.practice
          }}
          onClose={() => {
            setShowBookingFlow(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}