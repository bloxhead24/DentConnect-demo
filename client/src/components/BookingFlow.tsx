import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import type { Practice, Appointment, Dentist } from "@shared/schema";
import { GDPRPrivacyNotice, type ConsentData } from "./GDPRPrivacyNotice";
import { TriageAssessment, type TriageAssessmentData } from "./TriageAssessment";
import { UrgencyQuestionnaire, type UrgencyData } from "./UrgencyQuestionnaire";

interface BookingFlowProps {
  practice: Practice | null;
  appointment: Appointment | null;
  dentist?: Dentist | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingFlow({ practice, appointment, dentist, isOpen, onClose, onSuccess }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<"urgency" | "gdpr" | "triage" | "details" | "confirmation" | "success">("urgency");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    emergencyContact: "",
    specialRequests: ""
  });
  const [consentData, setConsentData] = useState<ConsentData>({
    gdprConsent: false,
    marketingConsent: false,
    clinicalDataConsent: false,
    communicationConsent: false
  });
  const [urgencyData, setUrgencyData] = useState<UrgencyData>({
    painLevel: 0,
    painDuration: "",
    symptoms: "",
    swelling: false,
    trauma: false,
    bleeding: false,
    infection: false,
    urgencyLevel: "low",
    additionalNotes: ""
  });
  const [triageData, setTriageData] = useState<TriageAssessmentData>({
    painLevel: 0,
    painDuration: "",
    symptoms: "",
    swelling: false,
    trauma: false,
    bleeding: false,
    infection: false,
    urgencyLevel: "low",
    triageNotes: "",
    anxietyLevel: "none",
    medicalHistory: "",
    currentMedications: "",
    allergies: "",
    previousDentalTreatment: "",
    smokingStatus: "never",
    alcoholConsumption: "none",
    pregnancyStatus: "not-applicable"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!practice || !appointment) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUrgencyComplete = (data: UrgencyData) => {
    setUrgencyData(data);
    setCurrentStep("gdpr");
  };

  const handleGDPRConsent = (consents: ConsentData) => {
    setConsentData(consents);
    setCurrentStep("triage");
  };

  const handleTriageComplete = (assessment: TriageAssessmentData) => {
    // Store the complete triage assessment data
    setTriageData(assessment);
    setCurrentStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Starting booking submission...');
      
      // Create user first or get existing user
      const userPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || null,
        userType: 'patient',
        emergencyContact: formData.emergencyContact || null
      };
      
      console.log('User payload:', userPayload);
      
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });

      let user;
      if (userResponse.ok) {
        user = await userResponse.json();
        console.log('User created:', user);
      } else {
        // If user creation fails (likely due to existing email), try to get existing user
        const existingUserResponse = await fetch(`/api/users/email/${encodeURIComponent(formData.email)}`);
        if (existingUserResponse.ok) {
          user = await existingUserResponse.json();
          console.log('Using existing user:', user);
        } else {
          const errorData = await userResponse.json();
          console.error('User creation failed:', errorData);
          throw new Error('Failed to create or find user');
        }
      }

      // Create booking with all compliance data
      const bookingPayload = {
        userId: user.id,
        appointmentId: appointment.id,
        treatmentCategory: appointment.treatmentType,
        specialRequests: formData.specialRequests || null,
        status: 'pending_approval',
        approvalStatus: 'pending'
      };
      
      console.log('Booking payload:', bookingPayload);
      
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        console.error('Booking creation failed:', errorData);
        throw new Error('Failed to create booking');
      }

      const booking = await bookingResponse.json();
      console.log('Booking created:', booking);

      // Create triage assessment if we have triage data
      if (triageData && triageData.painLevel !== undefined) {
        const triagePayload = {
          userId: user.id,
          painLevel: triageData.painLevel,
          painDuration: triageData.painDuration,
          symptoms: triageData.symptoms,
          swelling: triageData.swelling,
          trauma: triageData.trauma,
          bleeding: triageData.bleeding,
          infection: triageData.infection,
          urgencyLevel: triageData.urgencyLevel,
          triageNotes: triageData.triageNotes,
          anxietyLevel: triageData.anxietyLevel,
          medicalHistory: triageData.medicalHistory,
          currentMedications: triageData.currentMedications,
          allergies: triageData.allergies,
          previousDentalTreatment: triageData.previousDentalTreatment,
          smokingStatus: triageData.smokingStatus,
          alcoholConsumption: triageData.alcoholConsumption,
          pregnancyStatus: triageData.pregnancyStatus
        };
        
        console.log('Triage payload:', triagePayload);
        
        const triageResponse = await fetch('/api/triage-assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(triagePayload)
        });

        if (triageResponse.ok) {
          const triageAssessment = await triageResponse.json();
          console.log('Triage assessment created:', triageAssessment);
          
          // Update booking with triage assessment ID
          const updateBookingPayload = {
            triageAssessmentId: triageAssessment.id,
            accessibilityNeeds: formData.specialRequests || null,
            medications: triageData.currentMedications ? true : false,
            allergies: triageData.allergies ? true : false,
            anxietyLevel: triageData.anxietyLevel
          };
          
          const updateResponse = await fetch(`/api/bookings/${booking.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateBookingPayload)
          });

          if (updateResponse.ok) {
            console.log('Booking updated with triage assessment');
          } else {
            console.error('Failed to update booking with triage assessment');
          }
        } else {
          console.error('Failed to create triage assessment');
        }
      }

      setCurrentStep("success");
    } catch (error) {
      console.error('Booking submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <i className={cn(
                "text-white",
                currentStep === "urgency" ? "fas fa-exclamation-triangle" :
                currentStep === "gdpr" ? "fas fa-shield-alt" :
                currentStep === "triage" ? "fas fa-stethoscope" :
                "fas fa-calendar-check"
              )}></i>
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {currentStep === "urgency" ? "Quick Assessment" :
                 currentStep === "gdpr" ? "Data Protection Notice" :
                 currentStep === "triage" ? "Clinical Assessment" :
                 "Book Appointment"}
              </h3>
              <p className="text-sm text-gray-600">
                {currentStep === "urgency" ? "Help us understand your dental needs" :
                 currentStep === "gdpr" ? "GDPR compliance and consent management" :
                 currentStep === "triage" ? "Clinical triage for patient safety" :
                 "Complete your booking details"}
              </p>
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

        {currentStep === "urgency" && (
          <UrgencyQuestionnaire
            onComplete={handleUrgencyComplete}
            onBack={onClose}
          />
        )}

        {currentStep === "gdpr" && (
          <GDPRPrivacyNotice
            isOpen={true}
            onClose={() => setCurrentStep("details")}
            onConsentGiven={handleGDPRConsent}
            showAsModal={false}
          />
        )}

        {currentStep === "triage" && (
          <TriageAssessment
            onComplete={handleTriageComplete}
            onCancel={() => setCurrentStep("gdpr")}
          />
        )}

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
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
              <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Submitted!</h3>
              <p className="text-gray-600">Your appointment request has been successfully submitted.</p>
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
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  <i className="fas fa-stethoscope mr-2"></i>
                  Next Steps
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Your appointment will be triaged by the dentist</p>
                  <p>• You'll receive an email confirmation if approved</p>
                  <p>• The dentist will review your symptoms and urgency level</p>
                  <p>• Check your email for updates on your appointment status</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                A confirmation email will be sent to {formData.email} once your appointment is approved by the dentist.
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