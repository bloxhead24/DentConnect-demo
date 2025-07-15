import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, Phone, Clock, Zap, CheckCircle, Calendar } from "lucide-react";
import { toast } from "../hooks/use-toast";

interface CallbackRequestModalProps {
  practiceId: number;
  practiceName: string;
  children: React.ReactNode;
}

export function CallbackRequestModal({ practiceId, practiceName, children }: CallbackRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Patient details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    
    // Callback request details
    requestType: "cancelled_appointment",
    requestReason: "",
    preferredCallTime: "anytime",
    urgency: "medium",
    
    // Triage assessment
    painLevel: 0,
    painDuration: "",
    symptoms: "",
    swelling: false,
    trauma: false,
    bleeding: false,
    infection: false,
    urgencyLevel: "low",
    triageNotes: "",
    anxietyLevel: "low",
    medicalHistory: "",
    currentMedications: "",
    allergies: "",
    previousDentalTreatment: "",
    smokingStatus: "never",
    alcoholConsumption: "never",
    pregnancyStatus: "not_applicable"
  });

  const queryClient = useQueryClient();

  const callbackRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create user first or get existing user
      let user;
      try {
        const userResponse = await apiRequest("POST", "/api/users", {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          userType: "patient"
        });
        user = await userResponse.json();
      } catch (error) {
        // If user creation fails (likely due to existing email), try to get existing user
        const existingUserResponse = await fetch(`/api/users/email/${encodeURIComponent(data.email)}`);
        if (existingUserResponse.ok) {
          user = await existingUserResponse.json();
        } else {
          throw new Error('Failed to create or find user');
        }
      }

      // Create triage assessment
      const triageResponse = await apiRequest("POST", "/api/triage-assessments", {
        userId: user.id,
        painLevel: data.painLevel,
        painDuration: data.painDuration,
        symptoms: data.symptoms,
        swelling: data.swelling,
        trauma: data.trauma,
        bleeding: data.bleeding,
        infection: data.infection,
        urgencyLevel: data.urgencyLevel,
        triageNotes: data.triageNotes,
        anxietyLevel: data.anxietyLevel,
        medicalHistory: data.medicalHistory,
        currentMedications: data.currentMedications,
        allergies: data.allergies,
        previousDentalTreatment: data.previousDentalTreatment,
        smokingStatus: data.smokingStatus,
        alcoholConsumption: data.alcoholConsumption,
        pregnancyStatus: data.pregnancyStatus
      });

      const triage = await triageResponse.json();

      // Create callback request
      const callbackData = {
        userId: user.id,
        practiceId: practiceId,
        requestType: data.requestType,
        requestReason: data.requestReason,
        preferredCallTime: data.preferredCallTime,
        urgency: data.urgency,
        status: "pending"
      };
      
      // Only include triage assessment if it exists
      if (triage && triage.id) {
        callbackData.triageAssessmentId = triage.id;
      }
      
      return apiRequest("POST", "/api/callback-requests", callbackData);
    },
    onSuccess: () => {
      toast({
        title: "Callback request submitted",
        description: "You will receive a call the moment a cancellation slot becomes available. Please answer quickly to secure your appointment.",
      });
      setIsOpen(false);
      setStep(1);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        requestType: "cancellation",
        requestReason: "",
        preferredCallTime: "anytime",
        urgency: "medium",
        painLevel: 0,
        painDuration: "",
        symptoms: "",
        swelling: false,
        trauma: false,
        bleeding: false,
        infection: false,
        urgencyLevel: "low",
        triageNotes: "",
        anxietyLevel: "low",
        medicalHistory: "",
        currentMedications: "",
        allergies: "",
        previousDentalTreatment: "",
        smokingStatus: "never",
        alcoholConsumption: "never",
        pregnancyStatus: "not_applicable"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/practice/${practiceId}/callback-requests/today`] });
      queryClient.invalidateQueries({ queryKey: [`/api/practice/${practiceId}/callback-requests/previous/7`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit callback request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    callbackRequestMutation.mutate(formData);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Enter your last name"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter your phone number"
        />
      </div>
      
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label>Request Type</Label>
        <RadioGroup 
          value={formData.requestType} 
          onValueChange={(value) => setFormData({ ...formData, requestType: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cancellation" id="cancellation" />
            <Label htmlFor="cancellation">Instant Cancellation Alert</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="availability" id="availability" />
            <Label htmlFor="availability">Next Available Slot</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="emergency" id="emergency" />
            <Label htmlFor="emergency">Emergency Callback</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <Label htmlFor="requestReason">Reason for Request</Label>
        <Textarea
          id="requestReason"
          value={formData.requestReason}
          onChange={(e) => setFormData({ ...formData, requestReason: e.target.value })}
          placeholder="Please describe your situation..."
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="preferredCallTime">Preferred Call Time</Label>
        <Select value={formData.preferredCallTime} onValueChange={(value) => setFormData({ ...formData, preferredCallTime: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select preferred time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
            <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
            <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
            <SelectItem value="anytime">Anytime</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Urgency Level</Label>
        <RadioGroup 
          value={formData.urgency} 
          onValueChange={(value) => setFormData({ ...formData, urgency: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low">Low - Can wait a few days</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Medium - Within 24 hours</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high">High - As soon as possible</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="painLevel">Pain Level (0-10)</Label>
        <Input
          id="painLevel"
          type="range"
          min="0"
          max="10"
          value={formData.painLevel}
          onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
        />
        <div className="text-center text-sm text-gray-600">
          Current: {formData.painLevel}/10
        </div>
      </div>
      
      <div>
        <Label htmlFor="painDuration">Pain Duration</Label>
        <Select value={formData.painDuration} onValueChange={(value) => setFormData({ ...formData, painDuration: value })}>
          <SelectTrigger>
            <SelectValue placeholder="How long have you had pain?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No pain</SelectItem>
            <SelectItem value="less_than_hour">Less than 1 hour</SelectItem>
            <SelectItem value="few_hours">A few hours</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="few_days">A few days</SelectItem>
            <SelectItem value="week">About a week</SelectItem>
            <SelectItem value="longer">Longer than a week</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="symptoms">Symptoms</Label>
        <Textarea
          id="symptoms"
          value={formData.symptoms}
          onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
          placeholder="Describe your symptoms..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="swelling"
            checked={formData.swelling}
            onChange={(e) => setFormData({ ...formData, swelling: e.target.checked })}
          />
          <Label htmlFor="swelling">Swelling</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="trauma"
            checked={formData.trauma}
            onChange={(e) => setFormData({ ...formData, trauma: e.target.checked })}
          />
          <Label htmlFor="trauma">Trauma/Injury</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="bleeding"
            checked={formData.bleeding}
            onChange={(e) => setFormData({ ...formData, bleeding: e.target.checked })}
          />
          <Label htmlFor="bleeding">Bleeding</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="infection"
            checked={formData.infection}
            onChange={(e) => setFormData({ ...formData, infection: e.target.checked })}
          />
          <Label htmlFor="infection">Infection</Label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="medicalHistory">Medical History</Label>
        <Textarea
          id="medicalHistory"
          value={formData.medicalHistory}
          onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
          placeholder="Any relevant medical conditions..."
          rows={2}
        />
      </div>
      
      <div>
        <Label htmlFor="currentMedications">Current Medications</Label>
        <Textarea
          id="currentMedications"
          value={formData.currentMedications}
          onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
          placeholder="List any medications you're taking..."
          rows={2}
        />
      </div>
      
      <div>
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea
          id="allergies"
          value={formData.allergies}
          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          placeholder="Any known allergies..."
          rows={2}
        />
      </div>
      
      <div>
        <Label htmlFor="anxietyLevel">Anxiety Level</Label>
        <Select value={formData.anxietyLevel} onValueChange={(value) => setFormData({ ...formData, anxietyLevel: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select anxiety level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch(step) {
      case 1: return "Personal Information";
      case 2: return "Callback Request Details";
      case 3: return "Clinical Assessment";
      case 4: return "Medical History";
      default: return "Callback Request";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-teal-600" />
            Instant Cancellation Alert - {practiceName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  stepNum <= step 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNum < step ? <CheckCircle className="h-4 w-4" /> : stepNum}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{getStepTitle()}</CardTitle>
              <CardDescription>
                {step === 1 && "Please provide your contact information"}
                {step === 2 && "Tell us about your callback request"}
                {step === 3 && "Help us assess your clinical needs"}
                {step === 4 && "Complete your medical background"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                disabled={callbackRequestMutation.isPending}
              >
                Previous
              </Button>
            )}
            {step < 4 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                className="ml-auto"
                disabled={callbackRequestMutation.isPending}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="ml-auto"
                disabled={callbackRequestMutation.isPending}
              >
                {callbackRequestMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}