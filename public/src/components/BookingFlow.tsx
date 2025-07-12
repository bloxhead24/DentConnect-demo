import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Practice, Appointment, Dentist } from "@shared/schema";

interface BookingFlowProps {
  practice: Practice | null;
  appointment: Appointment | null;
  dentist?: Dentist | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingFlow({ practice, appointment, dentist, isOpen, onClose, onSuccess }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<"details" | "confirmation" | "success">("details");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    emergencyContact: "",
    medicalConditions: "",
    medications: "",
    allergies: "",
    specialRequests: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!practice || !appointment) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-calendar-check text-white"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold">Book Appointment</h3>
              <p className="text-sm text-gray-600">Complete your booking details</p>
            </div>
          </DialogTitle>
          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-700 text-center">
              <strong>Demo Notice:</strong> This booking form is for demonstration purposes only. 
              No appointments will be created and no personal information is stored.
            </p>
          </div>
        </DialogHeader>

        {currentStep === "details" && (
          <div className="space-y-6">
            {/* Appointment Summary */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg">Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-building text-primary"></i>
                    <span className="font-medium">{practice.name}</span>
                  </div>
                  <Badge variant="outline">{appointment.treatmentType}</Badge>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-calendar text-primary"></i>
                  <span>{format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-clock text-primary"></i>
                  <span>{appointment.appointmentTime} ({appointment.duration} minutes)</span>
                </div>
                
                {dentist && (
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-user-md text-primary"></i>
                    <span>Dr. {dentist.firstName} {dentist.lastName}</span>
                  </div>
                )}
                
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Appointment Booking Fee:</span>
                    <span className="text-2xl font-bold text-primary">£5</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <p><strong>Treatment costs:</strong> Assessed and quoted during your appointment</p>
                    <p>Final pricing depends on your specific needs and chosen treatments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Details Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
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
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Name and phone number"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <Textarea
                      id="medicalConditions"
                      placeholder="List any medical conditions, heart problems, diabetes, etc."
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      placeholder="List all medications you're currently taking"
                      value={formData.medications}
                      onChange={(e) => handleInputChange("medications", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      placeholder="Drug allergies, latex, etc."
                      value={formData.allergies}
                      onChange={(e) => handleInputChange("allergies", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Any special needs or requests for your appointment"
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isFormValid || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Booking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Confirm Booking
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
              <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">Your appointment has been successfully booked.</p>
            </div>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">Appointment Confirmation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Practice:</span>
                    <span className="font-medium">{practice.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{appointment.appointmentTime}</span>
                  </div>
                  {dentist && (
                    <div className="flex justify-between">
                      <span>Dentist:</span>
                      <span className="font-medium">Dr. {dentist.firstName} {dentist.lastName}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                A confirmation email has been sent to {formData.email}
              </p>
              
              <Button 
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <i className="fas fa-star mr-2"></i>
                Get Early Access
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}