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
  const [currentStep, setCurrentStep] = useState<"loading" | "questions" | "searching" | "result">("loading");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [searchProgress, setSearchProgress] = useState(0);
  const [matchedAppointment, setMatchedAppointment] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initial loading animation
    if (currentStep === "loading") {
      setTimeout(() => {
        setCurrentStep("questions");
      }, 2000);
    }
  }, [currentStep]);

  useEffect(() => {
    // Searching animation
    if (currentStep === "searching") {
      const interval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Mock matched appointment
            setMatchedAppointment({
              practice: {
                name: "Newcastle Dental Excellence",
                address: "123 Grey Street, Newcastle upon Tyne, NE1 6EE",
                distance: "2.3 km",
                travelTime: "7 minutes"
              },
              dentist: {
                name: "Dr. Sarah Thompson",
                specialization: "Emergency Dental Care",
                rating: 4.8,
                experience: "12 years"
              },
              appointment: {
                date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                duration: "30 minutes",
                type: "Emergency Consultation"
              },
              estimatedCost: "£85-120"
            });
            setCurrentStep("result");
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

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
    if (approved) {
      toast({
        title: "Booking Confirmed!",
        description: "You'll receive confirmation details shortly. The practice will contact you within 15 minutes.",
        duration: 5000,
      });
      // In real app, this would navigate to booking confirmation
      onClose();
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
                  Available in {format(matchedAppointment.appointment.date, "h:mm a")} • 
                  {matchedAppointment.practice.travelTime} away
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
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-muted-foreground" />
                      <span>{matchedAppointment.practice.distance} • {matchedAppointment.practice.travelTime}</span>
                    </div>
                  </div>
                </div>

                {/* Dentist Info */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{matchedAppointment.dentist.name}</h5>
                      <p className="text-sm text-muted-foreground">{matchedAppointment.dentist.specialization}</p>
                      <p className="text-sm text-muted-foreground">{matchedAppointment.dentist.experience} experience</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">★ {matchedAppointment.dentist.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="border-t pt-4">
                  <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Appointment Time:</span>
                      <span className="text-sm">{format(matchedAppointment.appointment.date, "h:mm a 'today'")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Duration:</span>
                      <span className="text-sm">{matchedAppointment.appointment.duration}</span>
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
    </div>
  );
}