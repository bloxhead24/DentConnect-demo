import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EarlyAccessPopup } from "@/components/EarlyAccessPopup";

interface SearchQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: QuestionnaireData) => void;
}

export interface QuestionnaireData {
  medicalConditions: string[];
  medications: string;
  allergies: string;
  dentalHistory: string;
  anxietyLevel: string;
  urgency: string;
  preferredTime: string;
  additionalNotes: string;
}

export function SearchQuestionnaire({ isOpen, onClose, onComplete }: SearchQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const [formData, setFormData] = useState<QuestionnaireData>({
    medicalConditions: [],
    medications: "",
    allergies: "",
    dentalHistory: "",
    anxietyLevel: "",
    urgency: "",
    preferredTime: "",
    additionalNotes: "",
  });

  const totalSteps = 4;

  const medicalConditions = [
    { id: "diabetes", name: "Diabetes", icon: "fas fa-heartbeat" },
    { id: "heartDisease", name: "Heart Disease", icon: "fas fa-heart" },
    { id: "bloodPressure", name: "High Blood Pressure", icon: "fas fa-tint" },
    { id: "arthritis", name: "Arthritis", icon: "fas fa-hand-paper" },
    { id: "pregnancy", name: "Pregnancy", icon: "fas fa-baby" },
    { id: "none", name: "None of the above", icon: "fas fa-check" },
  ];

  const anxietyLevels = [
    { 
      value: "comfortable", 
      label: "Very Comfortable", 
      description: "I'm relaxed about dental visits",
      color: "bg-green-500",
      icon: "fas fa-smile"
    },
    { 
      value: "nervous", 
      label: "A Little Nervous", 
      description: "I'd appreciate gentle care",
      color: "bg-yellow-500",
      icon: "fas fa-meh"
    },
    { 
      value: "anxious", 
      label: "Quite Anxious", 
      description: "I need extra support and patience",
      color: "bg-orange-500",
      icon: "fas fa-frown"
    },
    { 
      value: "very-anxious", 
      label: "Very Anxious", 
      description: "I may need sedation options",
      color: "bg-red-500",
      icon: "fas fa-sad-tear"
    },
  ];

  const updateFormData = (data: Partial<QuestionnaireData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const toggleMedicalCondition = (conditionId: string) => {
    setFormData(prev => {
      const conditions = [...prev.medicalConditions];
      if (conditionId === "none") {
        return { ...prev, medicalConditions: conditions.includes("none") ? [] : ["none"] };
      }
      
      const index = conditions.indexOf(conditionId);
      if (index > -1) {
        conditions.splice(index, 1);
      } else {
        conditions.push(conditionId);
        // Remove "none" if other conditions are selected
        const noneIndex = conditions.indexOf("none");
        if (noneIndex > -1) {
          conditions.splice(noneIndex, 1);
        }
      }
      return { ...prev, medicalConditions: conditions };
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
      onClose();
      // Show early access popup after questionnaire completion
      setTimeout(() => setShowEarlyAccess(true), 800);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      medicalConditions: [],
      medications: "",
      allergies: "",
      dentalHistory: "",
      anxietyLevel: "",
      urgency: "",
      preferredTime: "",
      additionalNotes: "",
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <SheetTitle className="text-left">A few gentle questions</SheetTitle>
          <p className="text-sm text-gray-600 text-left">This helps us find the perfect dentist for you</p>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{currentStep} of {totalSteps}</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>

          {/* Step 1: Medical Conditions */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-user-md text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Medical History</h3>
                <p className="text-gray-600">Do you have any of these conditions?</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {medicalConditions.map((condition) => (
                  <Card
                    key={condition.id}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.medicalConditions.includes(condition.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-primary/5'
                    }`}
                    onClick={() => toggleMedicalCondition(condition.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <i className={`${condition.icon} text-primary text-sm`}></i>
                      </div>
                      <span className="font-medium text-gray-900">{condition.name}</span>
                      {formData.medicalConditions.includes(condition.id) && (
                        <i className="fas fa-check text-primary ml-auto"></i>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Medications & Allergies */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-pills text-orange-500 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Medications & Allergies</h3>
                <p className="text-gray-600">Help us keep you safe during treatment</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Current medications (if any)
                  </label>
                  <Textarea
                    placeholder="List any medications you're currently taking..."
                    value={formData.medications}
                    onChange={(e) => updateFormData({ medications: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Known allergies (if any)
                  </label>
                  <Textarea
                    placeholder="List any allergies or adverse reactions..."
                    value={formData.allergies}
                    onChange={(e) => updateFormData({ allergies: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dental Anxiety Assessment */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-heart text-green-500 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">How are you feeling?</h3>
                <p className="text-gray-600">We understand dental visits can be stressful</p>
              </div>
              
              <img 
src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200' viewBox='0 0 800 200'%3E%3Crect width='800' height='200' fill='%2306B6D4'/%3E%3Ctext x='400' y='100' text-anchor='middle' dy='.3em' fill='white' font-size='32' font-family='Arial'%3E🏥 Medical Assessment%3C/text%3E%3C/svg%3E" 
                alt="Calm dental environment" 
                className="w-full h-32 object-cover rounded-2xl shadow-soft"
              />
              
              <div className="space-y-3">
                {anxietyLevels.map((level) => (
                  <Card
                    key={level.value}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.anxietyLevel === level.value 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-primary/5'
                    }`}
                    onClick={() => updateFormData({ anxietyLevel: level.value })}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${level.color} rounded-full flex items-center justify-center`}>
                        <i className={`${level.icon} text-white text-sm`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{level.label}</h4>
                        <p className="text-xs text-gray-600">{level.description}</p>
                      </div>
                      {formData.anxietyLevel === level.value && (
                        <i className="fas fa-check text-primary"></i>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Preferences & Summary */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-calendar-check text-blue-500 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Final details</h3>
                <p className="text-gray-600">When would you prefer your appointment?</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">How urgent is this?</label>
                  <Select value={formData.urgency} onValueChange={(value) => updateFormData({ urgency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency - ASAP</SelectItem>
                      <SelectItem value="urgent">Urgent - Within 24 hours</SelectItem>
                      <SelectItem value="soon">Soon - Within a week</SelectItem>
                      <SelectItem value="flexible">Flexible - Anytime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Preferred time of day</label>
                  <Select value={formData.preferredTime} onValueChange={(value) => updateFormData({ preferredTime: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                      <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                      <SelectItem value="any">Any time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Anything else we should know?
                  </label>
                  <Textarea
                    placeholder="Any additional information or special requests..."
                    value={formData.additionalNotes}
                    onChange={(e) => updateFormData({ additionalNotes: e.target.value })}
                    className="min-h-[60px]"
                  />
                </div>
              </div>

              {/* Summary */}
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-800">Quick Summary</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.medicalConditions.length > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {formData.medicalConditions.length} medical condition(s)
                      </Badge>
                    )}
                    {formData.anxietyLevel && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {anxietyLevels.find(l => l.value === formData.anxietyLevel)?.label}
                      </Badge>
                    )}
                    {formData.urgency && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {formData.urgency}
                      </Badge>
                    )}
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
              {currentStep === 1 ? 'Skip' : 'Back'}
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90" 
              onClick={nextStep}
            >
              {currentStep === totalSteps ? 'Find Dentists' : 'Next'}
            </Button>
          </div>
        </div>
      </SheetContent>
      
      {/* Early Access Popup */}
      <EarlyAccessPopup 
        isOpen={showEarlyAccess}
        onClose={() => setShowEarlyAccess(false)}
        trigger="questionnaire"
        title="Great Progress! 🎯"
        description="You've completed your preferences. See how DentConnect makes dental care accessible."
      />
    </Sheet>
  );
}