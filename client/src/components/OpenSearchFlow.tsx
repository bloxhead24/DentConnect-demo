import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Clock, AlertCircle, CheckCircle, XCircle, Navigation, Phone, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { BookingFlow } from "@/components/BookingFlow";
import { cn } from "@/lib/utils";

interface DentalQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; urgency?: number; estimatedTime?: string }[];
}

const dentalQuestions: DentalQuestion[] = [
  {
    id: "pain-level",
    question: "How would you describe your current pain level?",
    options: [
      { value: "severe", label: "Severe pain (8-10/10)", urgency: 10, estimatedTime: "30-45 minutes" },
      { value: "moderate", label: "Moderate pain (5-7/10)", urgency: 7, estimatedTime: "45-90 minutes" },
      { value: "mild", label: "Mild discomfort (2-4/10)", urgency: 4, estimatedTime: "2-4 hours" },
      { value: "none", label: "No pain, routine check", urgency: 1, estimatedTime: "Same day" }
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
  const [currentStep, setCurrentStep] = useState<"loading" | "questions" | "searching" | "result" | "booking" | "no-appointments">("loading");
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
    // Initial loading animation - faster
    if (currentStep === "loading") {
      setTimeout(() => {
        setCurrentStep("questions");
      }, 1000); // Reduced from 2000ms
    }
  }, [currentStep]);

  useEffect(() => {
    // Searching animation - much faster
    if (currentStep === "searching") {
      const interval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            
            // Check if we have any appointments
            if (!availableAppointments || availableAppointments.length === 0) {
              setCurrentStep("no-appointments");
              return 100;
            }
            
            // Find the best matching appointment based on urgency and distance
            const urgencyScore = calculateUrgencyScore(answers);
            const bestAppointment = findBestAppointment(availableAppointments, urgencyScore);
            
            if (bestAppointment) {
              setMatchedAppointment(bestAppointment);
              setCurrentStep("result");
            } else {
              // No appointments found
              setCurrentStep("no-appointments");
            }
            return 100;
          }
          return prev + 10; // Increased from 5 to 10 for faster progress
        });
      }, 50); // Reduced from 100ms to 50ms

      return () => clearInterval(interval);
    }
  }, [currentStep, availableAppointments, answers]);

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
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-white rounded-full shadow-lg"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <AnimatePresence mode="wait">
        {/* Initial Loading */}
        {currentStep === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="w-full h-full rounded-full border-4 border-teal-200 border-t-teal-600" />
              </motion.div>
              
              {/* Inner pulsing circle */}
              <motion.div
                animate={{ scale: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <Search className="w-12 h-12 text-white" />
              </motion.div>
              
              {/* Orbiting dots */}
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: index * 0.66
                  }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-400 rounded-full" />
                </motion.div>
              ))}
            </div>
            
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-light mb-3 bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent"
            >
              Activating Smart Search
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 text-lg"
            >
              Finding the fastest available appointment for you...
            </motion.p>
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
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Quick Assessment</h3>
                  <span className="text-sm text-muted-foreground">
                    {currentQuestionIndex + 1} of {dentalQuestions.length}
                  </span>
                </div>
                
                {/* Friendly accuracy note throughout assessment */}
                <p className="text-xs text-gray-600 mb-3">
                  Your honest answers help us connect you with the right dental care quickly and safely.
                </p>
                
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
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <div className="text-sm">{option.label}</div>
                          {option.estimatedTime && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Estimated connection time: {option.estimatedTime}
                            </div>
                          )}
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>

              {/* Show estimated time info for pain level question */}
              {currentQuestionIndex === 0 && answers["pain-level"] && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium">Total Connection Time Estimate</p>
                      <p className="mt-1">
                        Based on your pain level, we estimate you'll be connected to an appointment in{" "}
                        <span className="font-semibold">
                          {dentalQuestions[0].options.find(opt => opt.value === answers["pain-level"])?.estimatedTime}
                        </span>
                        . This includes finding an available slot and dentist approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                {currentQuestionIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className={currentQuestionIndex > 0 ? "flex-1" : "w-full"}
                >
                  Cancel Search
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Searching */}
        {currentStep === "searching" && (
          <motion.div
            key="searching"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center w-full max-w-lg"
          >
            <Card className="p-8 bg-white shadow-lg">
              {/* Enhanced Search Animation with Tooth */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                {/* Simple pulse effect */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-teal-100 rounded-full"
                />
                
                {/* Map pin with tooth icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-teal-600" />
                  
                  {/* Animated tooth inside map pin */}
                  <motion.div
                    animate={{ 
                      y: [-2, 2, -2],
                      rotate: [-5, 5, -5]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-white"
                    >
                      <path
                        d="M12 2C10.5 2 9.5 3 9.5 4.5C9.5 5.5 9 6 8 6C6.5 6 5.5 7 5.5 8.5C5.5 10 6 11 6 13C6 16 7 18 8.5 19.5C9.5 20.5 10.5 21 12 21C13.5 21 14.5 20.5 15.5 19.5C17 18 18 16 18 13C18 11 18.5 10 18.5 8.5C18.5 7 17.5 6 16 6C15 6 14.5 5.5 14.5 4.5C14.5 3 13.5 2 12 2Z"
                        fill="currentColor"
                      />
                    </svg>
                  </motion.div>
                </div>
                
                {/* Orbiting sparkles */}
                {[0, 120, 240].map((rotation, index) => (
                  <motion.div
                    key={rotation}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 2
                    }}
                    className="absolute inset-0"
                  >
                    <div 
                      className="absolute w-2 h-2 bg-teal-400 rounded-full"
                      style={{ 
                        top: '10%', 
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </motion.div>
                ))}
              </div>
              
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-medium mb-2 text-gray-800"
              >
                Finding Your Appointment
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-600 mb-6"
              >
                Searching available appointments near you...
              </motion.p>
              
              {/* Simple Progress Bar */}
              <div className="mb-6">
                <Progress value={searchProgress} className="h-2" />
              </div>
              
              {/* Simple Status Message */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {searchProgress < 30 ? "Checking availability..." : 
                   searchProgress < 60 ? "Finding best matches..." :
                   searchProgress < 90 ? "Finalizing appointment..." :
                   "Almost ready..."}
                </p>
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

                {/* Map */}
                <div className="h-48 rounded-lg overflow-hidden border bg-gray-100">
                  <div className="relative h-full w-full">
                    {/* Simple static map image */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">{matchedAppointment.practice.name}</p>
                        <p className="text-xs text-gray-500">{matchedAppointment.practice.address}</p>
                      </div>
                    </div>
                    {/* Map overlay with location marker */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 animate-ping bg-teal-400 rounded-full opacity-75" style={{ width: '48px', height: '48px' }}></div>
                        <div className="relative bg-teal-600 rounded-full p-2">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
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

        {/* No Appointments Found */}
        {currentStep === "no-appointments" && (
          <motion.div
            key="no-appointments"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-gray-400" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-300 rounded-full" />
                </motion.div>
              </div>
              
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">No Appointments Available</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We couldn't find any available appointments at this moment. 
                This could be due to high demand or limited availability.
              </p>
              
              <div className="space-y-4 text-left bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-800">What you can do:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Try searching again in a few minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Contact practices directly using the map view</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Join the waiting list for priority notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Consider virtual consultation options</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setCurrentStep("questions");
                    setCurrentQuestionIndex(0);
                    setSearchProgress(0);
                    setAnswers({});
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  Try Again
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                New appointments are added throughout the day as cancellations occur
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Flow Modal */}
      {showBookingFlow && matchedAppointment && (
        <BookingFlow
          practice={matchedAppointment.practice}
          appointment={{
            id: matchedAppointment.id,
            practiceId: matchedAppointment.practice?.id || 1,
            dentistId: matchedAppointment.dentist?.id || 1,
            appointmentDate: matchedAppointment.appointment.date,
            appointmentTime: matchedAppointment.appointment.time,
            duration: matchedAppointment.appointment.duration,
            treatmentType: matchedAppointment.appointment.type,
            status: "available"
          }}
          dentist={matchedAppointment.dentist}
          isOpen={showBookingFlow}
          onClose={() => {
            setShowBookingFlow(false);
            onClose();
          }}
          onSuccess={() => {
            setShowBookingFlow(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}