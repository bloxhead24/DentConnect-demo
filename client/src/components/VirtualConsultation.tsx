import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Video, Calendar, Clock, MessageCircle, Phone } from "lucide-react";
import { format, addMinutes } from "date-fns";

interface VirtualConsultationProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "patient" | "dentist";
  onSuccess: () => void;
}

export function VirtualConsultation({ isOpen, onClose, userType, onSuccess }: VirtualConsultationProps) {
  const [currentStep, setCurrentStep] = useState<"booking" | "confirmation" | "success">("booking");
  const [consultationType, setConsultationType] = useState<"immediate" | "scheduled">("immediate");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientDetails, setPatientDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    concern: "",
    urgency: "routine"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setPatientDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate booking submission
    setTimeout(() => {
      setCurrentStep("success");
      setIsSubmitting(false);
    }, 2000);
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
    setCurrentStep("booking");
  };

  const getAvailableSlots = () => {
    const now = new Date();
    const slots = [];
    
    // Generate next 8 time slots (15-minute intervals)
    for (let i = 0; i < 8; i++) {
      const time = addMinutes(now, 15 + (i * 15));
      slots.push({
        time: format(time, 'HH:mm'),
        display: format(time, 'h:mm a'),
        available: Math.random() > 0.3 // 70% availability
      });
    }
    
    return slots;
  };

  const availableSlots = getAvailableSlots();
  const isFormValid = patientDetails.firstName && patientDetails.lastName && patientDetails.email && patientDetails.concern;

  if (userType === "dentist") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Virtual Consultation Center</h3>
                <p className="text-sm text-gray-600">Manage your virtual appointments</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Earnings Information */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center space-x-2">
                  <span className="text-2xl">💰</span>
                  <span>Virtual Consultation Earnings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">30-minute Rate:</span>
                  <span className="text-2xl font-bold text-green-600">£20</span>
                </div>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• Pro-rata billing for consultation duration</p>
                  <p>• 15-minute minimum billing increment</p>
                  <p>• Automatic payment processing</p>
                  <p>• Same-day earnings transfer</p>
                  <p>• <strong>Patients pay £24.99 per 30-minute session</strong></p>
                  <p>• <strong>You earn £20 per 30-minute session</strong></p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Start Immediate Consultation</h4>
                  <p className="text-sm text-gray-600 mb-3">Connect with waiting patients now</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Go Live Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Schedule Virtual Slots</h4>
                  <p className="text-sm text-gray-600 mb-3">Set your availability for consultations</p>
                  <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                    Manage Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Today's Virtual Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Virtual Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: "14:30", patient: "Sarah M.", concern: "Tooth pain consultation", duration: "15 min", earnings: "£10" },
                    { time: "15:15", patient: "James K.", concern: "Follow-up check", duration: "30 min", earnings: "£20" },
                    { time: "16:00", patient: "Emma L.", concern: "Treatment planning", duration: "45 min", earnings: "£30" }
                  ].map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{appointment.time} - {appointment.patient}</div>
                          <div className="text-sm text-gray-600">{appointment.concern}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{appointment.earnings}</div>
                        <div className="text-xs text-gray-500">{appointment.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demo Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 text-center">
                <strong>Demo Notice:</strong> Virtual consultation features are for demonstration purposes. 
                Actual video calls and payments are not processed in this demo environment.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Virtual Consultation</h3>
              <p className="text-sm text-gray-600">Get dental advice from qualified professionals</p>
            </div>
          </DialogTitle>
          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-700 text-center">
              <strong>Demo Notice:</strong> Virtual consultations are for demonstration purposes only. 
              No actual video calls or payments will be processed.
            </p>
          </div>
        </DialogHeader>

        {currentStep === "booking" && (
          <div className="space-y-6">
            {/* Consultation Options */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-lg">Choose Consultation Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      consultationType === "immediate" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setConsultationType("immediate")}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Immediate Consultation</h4>
                        <p className="text-sm text-gray-600">Connect within 5 minutes</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">£24.99</div>
                      <div className="text-sm text-gray-600">Up to 30 minutes</div>
                    </div>
                  </div>

                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      consultationType === "scheduled" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setConsultationType("scheduled")}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Scheduled Consultation</h4>
                        <p className="text-sm text-gray-600">Book for later today</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">£24.99</div>
                      <div className="text-sm text-gray-600">Up to 30 minutes</div>
                    </div>
                  </div>
                </div>

                {/* Time Selection for Scheduled */}
                {consultationType === "scheduled" && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Available Times Today</h5>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`${!slot.available ? 'opacity-50' : ''}`}
                        >
                          {slot.display}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient Details Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={patientDetails.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={patientDetails.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientDetails.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={patientDetails.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="concern">Describe Your Concern *</Label>
                    <Textarea
                      id="concern"
                      placeholder="Please describe your dental concern or what you'd like to discuss..."
                      value={patientDetails.concern}
                      onChange={(e) => handleInputChange("concern", e.target.value)}
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <select
                      id="urgency"
                      value={patientDetails.urgency}
                      onChange={(e) => handleInputChange("urgency", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="routine">Routine - General advice</option>
                      <option value="concern">Moderate - Some discomfort</option>
                      <option value="urgent">Urgent - Significant pain</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Virtual Consultation Fee:</span>
                    <span className="text-2xl font-bold text-green-600">£24.99</span>
                  </div>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>• Up to 30-minute video consultation</p>
                    <p>• Professional dental advice</p>
                    <p>• Written summary provided</p>
                    <p>• Follow-up care recommendations</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Booking...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      {consultationType === "immediate" ? "Start Consultation" : "Book Consultation"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {currentStep === "success" && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-check text-3xl text-green-600"></i>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Consultation Booked!</h3>
              <p className="text-gray-600 mb-4">
                {consultationType === "immediate" 
                  ? "A dentist will connect with you within 5 minutes. Please keep your device ready."
                  : `Your consultation is scheduled for ${selectedTime} today.`
                }
              </p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">What's Next?</h4>
                <div className="text-sm text-blue-800 space-y-1 text-left">
                  <p>1. You'll receive a video call link via email</p>
                  <p>2. Ensure you have good lighting and internet</p>
                  <p>3. Have any relevant photos or documents ready</p>
                  <p>4. The consultation will be recorded for your records</p>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => window.open('https://dentconnect.replit.app/', '_blank')} 
              className="bg-green-600 hover:bg-green-700"
            >
              <i className="fas fa-star mr-2"></i>
              Get Early Access
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}