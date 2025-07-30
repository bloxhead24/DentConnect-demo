import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, User, Building2, AlertTriangle, Phone, Mail, FileText, ChevronRight, ArrowLeft, Zap, Info, CheckCircle } from "lucide-react";

interface Appointment {
  id: number;
  practiceId: number;
  dentistId: number;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  treatmentType: string;
}

interface Practice {
  id: number;
  name: string;
  address: string;
}

interface Dentist {
  id: number;
  name: string;
  specialization?: string;
}

interface EnhancedBookingFlowProps {
  practice: Practice | null;
  appointment: Appointment | null;
  dentist?: Dentist | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type BookingStep = 'emergency-check' | 'personal-details' | 'medical-info' | 'confirmation' | 'success';

export default function EnhancedBookingFlow({ 
  practice, 
  appointment, 
  dentist, 
  isOpen, 
  onClose, 
  onSuccess 
}: EnhancedBookingFlowProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<BookingStep>('emergency-check');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    
    // Medical Info
    emergencyContact: "",
    medicalConditions: "",
    medications: "",
    allergies: "",
    
    // Emergency Info
    painLevel: 0,
    symptoms: [] as string[],
    
    // Consents
    gdprConsent: false,
    treatmentConsent: false,
    
    // Additional
    specialRequests: ""
  });

  const [savedProgress, setSavedProgress] = useState<typeof formData | null>(null);

  if (!practice || !appointment) return null;

  const emergencySymptoms = [
    "Severe pain",
    "Facial swelling",
    "Bleeding that won't stop",
    "Broken tooth",
    "Lost filling",
    "Abscess or infection"
  ];

  const getStepIndex = (step: BookingStep): number => {
    const steps: BookingStep[] = ['emergency-check', 'personal-details', 'medical-info', 'confirmation', 'success'];
    return steps.indexOf(step);
  };

  const totalSteps = isEmergency ? 3 : 4;
  const currentStepIndex = getStepIndex(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  const handleEmergencyCheck = (emergency: boolean) => {
    setIsEmergency(emergency);
    if (emergency) {
      // Skip directly to personal details for emergency
      setCurrentStep('personal-details');
    } else {
      setCurrentStep('personal-details');
    }
  };

  const validatePersonalDetails = () => {
    const required = ['firstName', 'lastName', 'email', 'phone'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast({
        title: "Please fill in all required fields",
        description: `Missing: ${missing.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email address",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const validateMedicalInfo = () => {
    if (isEmergency && formData.painLevel === 0) {
      toast({
        title: "Please indicate your pain level",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.gdprConsent) {
      toast({
        title: "Privacy consent required",
        description: "Please accept the privacy policy to continue",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'personal-details':
        if (validatePersonalDetails()) {
          setCurrentStep('medical-info');
          // Auto-save progress
          setSavedProgress(formData);
        }
        break;
      
      case 'medical-info':
        if (validateMedicalInfo()) {
          setCurrentStep('confirmation');
        }
        break;
      
      case 'confirmation':
        handleSubmit();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'personal-details':
        setCurrentStep('emergency-check');
        break;
      case 'medical-info':
        setCurrentStep('personal-details');
        break;
      case 'confirmation':
        setCurrentStep('medical-info');
        break;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create booking
      const bookingData = {
        appointmentId: appointment.id,
        practiceId: practice.id,
        dentistId: appointment.dentistId,
        ...formData,
        isEmergency,
        bookingDate: new Date().toISOString()
      };

      console.log('Submitting booking:', bookingData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCurrentStep('success');
      
      toast({
        title: "Booking submitted!",
        description: "You'll receive confirmation shortly",
      });
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEmergencyCheck = () => (
    <div className="space-y-6">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Is this a dental emergency?</h3>
        <p className="text-gray-600">We prioritize emergency cases for faster treatment</p>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg text-amber-800">Emergency symptoms include:</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {emergencySymptoms.map((symptom, index) => (
              <li key={index} className="flex items-center text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                {symptom}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => handleEmergencyCheck(false)}
          className="h-16"
        >
          <div>
            <p className="font-semibold">Not an Emergency</p>
            <p className="text-xs text-gray-500">Regular appointment</p>
          </div>
        </Button>
        <Button
          onClick={() => handleEmergencyCheck(true)}
          className="bg-amber-600 hover:bg-amber-700 h-16"
        >
          <div className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            <div className="text-left">
              <p className="font-semibold">Yes, Emergency</p>
              <p className="text-xs">Fast-track booking</p>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Details</h3>
        
        {savedProgress && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your progress has been saved automatically
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@example.com"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone number *</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+44 7700 900000"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
        
        {isEmergency && (
          <div className="mb-6">
            <Label>Pain level (1-10) *</Label>
            <div className="mt-2">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.painLevel}
                onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Mild</span>
                <span className="font-semibold text-lg text-teal-600">{formData.painLevel}</span>
                <span>Severe</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="emergencyContact">Emergency contact</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Name and phone number"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="medicalConditions">Medical conditions</Label>
            <Textarea
              id="medicalConditions"
              value={formData.medicalConditions}
              onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
              placeholder="E.g., diabetes, heart conditions, etc."
              className="mt-1 h-20"
            />
          </div>

          <div>
            <Label htmlFor="medications">Current medications</Label>
            <Textarea
              id="medications"
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              placeholder="List any medications you're currently taking"
              className="mt-1 h-20"
            />
          </div>

          <div>
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="E.g., latex, penicillin, etc."
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="gdpr"
              checked={formData.gdprConsent}
              onCheckedChange={(checked) => setFormData({ ...formData, gdprConsent: checked as boolean })}
            />
            <Label htmlFor="gdpr" className="text-sm font-normal cursor-pointer">
              I agree to the privacy policy and understand how my data will be used *
            </Label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="treatment"
              checked={formData.treatmentConsent}
              onCheckedChange={(checked) => setFormData({ ...formData, treatmentConsent: checked as boolean })}
            />
            <Label htmlFor="treatment" className="text-sm font-normal cursor-pointer">
              I consent to dental examination and necessary treatment
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Confirm Your Booking</h3>
        
        <Card className="bg-teal-50 border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Practice</span>
              <span className="font-medium">{practice.name}</span>
            </div>
            {dentist && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dentist</span>
                <span className="font-medium">{dentist.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Date</span>
              <span className="font-medium">
                {format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time</span>
              <span className="font-medium">{appointment.appointmentTime} ({appointment.duration} mins)</span>
            </div>
            {isEmergency && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type</span>
                <Badge className="bg-amber-100 text-amber-800">Emergency</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
            <p><span className="font-medium">Email:</span> {formData.email}</p>
            <p><span className="font-medium">Phone:</span> {formData.phone}</p>
            {isEmergency && formData.painLevel > 0 && (
              <p><span className="font-medium">Pain level:</span> {formData.painLevel}/10</p>
            )}
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            A £5 booking fee applies. Treatment costs will be discussed during your appointment.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">Your appointment request has been successfully submitted.</p>
      </div>
      
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3">What happens next?</h4>
          <ul className="space-y-2 text-sm text-left">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>You'll receive an email confirmation shortly</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>The practice will review your booking</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>You'll be notified once approved</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Button 
        onClick={() => {
          onSuccess();
          onClose();
        }}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Done
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'emergency-check':
        return renderEmergencyCheck();
      case 'personal-details':
        return renderPersonalDetails();
      case 'medical-info':
        return renderMedicalInfo();
      case 'confirmation':
        return renderConfirmation();
      case 'success':
        return renderSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Book Appointment</span>
            {currentStep !== 'success' && (
              <Badge variant="outline" className="ml-2">
                {isEmergency ? 'Emergency' : 'Regular'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {currentStep !== 'success' && currentStep !== 'emergency-check' && (
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              Step {currentStepIndex} of {totalSteps}
            </p>
          </div>
        )}

        <div className="min-h-[400px]">
          {renderCurrentStep()}
        </div>

        {currentStep !== 'success' && currentStep !== 'emergency-check' && (
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : currentStep === 'confirmation' ? (
                <>
                  Confirm Booking
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}