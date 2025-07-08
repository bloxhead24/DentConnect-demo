import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Practice, Appointment } from "@shared/schema";
import { useBookingFlow } from "@/hooks/useBookingFlow";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DemoCompleteModal } from "./DemoCompleteModal";

interface BookingFlowProps {
  practice: Practice | null;
  selectedAppointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingFlow({ practice, selectedAppointment, isOpen, onClose, onSuccess }: BookingFlowProps) {
  const { currentStep, formData, updateFormData, nextStep, prevStep, resetFlow } = useBookingFlow();
  const { toast } = useToast();
  const [showDemoComplete, setShowDemoComplete] = useState(false);
  
  const handleDemoBooking = () => {
    // Instead of submitting the form, redirect to early access signup
    onSuccess();
    resetFlow();
    onClose();
    toast({
      title: "Demo Complete!",
      description: "Ready to book real appointments? Sign up for early access.",
    });
    // Show demo complete modal after 2 seconds
    setTimeout(() => {
      setShowDemoComplete(true);
    }, 2000);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      nextStep();
    } else {
      // Complete the demo booking
      handleDemoBooking();
    }
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  if (!practice || !selectedAppointment) return null;

  return (
    <>
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <SheetTitle className="text-left">Book Your Appointment</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-text-soft">
              <span>Booking Progress</span>
              <span>{currentStep} of 3</span>
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2" />
          </div>
          
          {/* Step 1: Medical History */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary">A few gentle questions</h3>
              <p className="text-text-soft">This helps us provide the best care for you</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Are you currently taking any medications?</label>
                  <div className="flex space-x-3">
                    <Button
                      variant={formData.medications ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updateFormData({ medications: true })}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={!formData.medications ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updateFormData({ medications: false })}
                    >
                      No
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Do you have any allergies we should know about?</label>
                  <div className="flex space-x-3">
                    <Button
                      variant={formData.allergies ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updateFormData({ allergies: true })}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={!formData.allergies ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updateFormData({ allergies: false })}
                    >
                      No
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">When was your last dental visit?</label>
                  <Select value={formData.lastDentalVisit} onValueChange={(value) => updateFormData({ lastDentalVisit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less-than-6-months">Less than 6 months ago</SelectItem>
                      <SelectItem value="6-12-months">6-12 months ago</SelectItem>
                      <SelectItem value="1-2-years">1-2 years ago</SelectItem>
                      <SelectItem value="more-than-2-years">More than 2 years ago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Anxiety Assessment */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary">How are you feeling?</h3>
              <p className="text-text-soft">We understand dental visits can be stressful. Let us know how we can help you feel comfortable.</p>
              
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300" 
                alt="Calm healthcare environment" 
                className="w-full h-32 object-cover rounded-2xl shadow-soft"
              />
              
              <div className="space-y-3">
                <Card
                  className={`p-4 cursor-pointer transition-all ${formData.anxietyLevel === 'comfortable' ? 'bg-green-50 border-green-200' : 'hover:bg-green-50'}`}
                  onClick={() => updateFormData({ anxietyLevel: 'comfortable' })}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-smile text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-medium">I feel comfortable</h4>
                      <p className="text-xs text-text-soft">Ready for my appointment</p>
                    </div>
                  </div>
                </Card>
                
                <Card
                  className={`p-4 cursor-pointer transition-all ${formData.anxietyLevel === 'nervous' ? 'bg-orange-50 border-orange-200' : 'hover:bg-orange-50'}`}
                  onClick={() => updateFormData({ anxietyLevel: 'nervous' })}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-meh text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-medium">I'm a bit nervous</h4>
                      <p className="text-xs text-text-soft">Could use some extra reassurance</p>
                    </div>
                  </div>
                </Card>
                
                <Card
                  className={`p-4 cursor-pointer transition-all ${formData.anxietyLevel === 'anxious' ? 'bg-red-50 border-red-200' : 'hover:bg-red-50'}`}
                  onClick={() => updateFormData({ anxietyLevel: 'anxious' })}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-frown text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-medium">I'm quite anxious</h4>
                      <p className="text-xs text-text-soft">Please take extra care with me</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
          
          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary">Confirm your appointment</h3>
              
              <img 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200" 
                alt="Dental clinic waiting room" 
                className="w-full h-32 object-cover rounded-2xl shadow-soft"
              />
              
              <Card className="p-4 bg-primary/5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-soft">Practice</span>
                    <span className="text-sm font-medium text-text-primary">{practice.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-soft">Date</span>
                    <span className="text-sm font-medium text-text-primary">{format(new Date(selectedAppointment.appointmentDate), 'PPP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-soft">Time</span>
                    <span className="text-sm font-medium text-text-primary">{format(new Date(selectedAppointment.appointmentDate), 'h:mm a')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-soft">Treatment</span>
                    <span className="text-sm font-medium text-text-primary">{formData.treatmentCategory}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-green-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-shield-alt text-white text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">GDPR Compliant</h4>
                    <p className="text-xs text-text-soft">Your data is secure and protected</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={currentStep === 1 ? handleClose : prevStep}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90" 
              onClick={handleNext}
            >
              {currentStep === 3 ? 'Complete Demo' : 'Next'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    
    <DemoCompleteModal 
      isOpen={showDemoComplete}
      onClose={() => setShowDemoComplete(false)}
      demoType="patient"
    />
  </>
  );
}
