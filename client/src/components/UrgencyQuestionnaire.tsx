import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { AlertTriangle, Clock, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "../lib/utils";

export interface UrgencyData {
  painLevel: number;
  painDuration: string;
  symptoms: string;
  swelling: boolean;
  trauma: boolean;
  bleeding: boolean;
  infection: boolean;
  urgencyLevel: string;
  additionalNotes: string;
}

interface UrgencyQuestionnaireProps {
  onComplete: (data: UrgencyData) => void;
  onBack: () => void;
}

export function UrgencyQuestionnaire({ onComplete, onBack }: UrgencyQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UrgencyData>({
    painLevel: 0,
    painDuration: "",
    symptoms: "",
    swelling: false,
    trauma: false,
    bleeding: false,
    infection: false,
    urgencyLevel: "",
    additionalNotes: ""
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate urgency level based on responses
      const urgencyLevel = calculateUrgencyLevel();
      onComplete({
        ...formData,
        urgencyLevel
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const calculateUrgencyLevel = () => {
    const { painLevel, trauma, bleeding, infection, swelling } = formData;
    
    // High urgency indicators
    if (painLevel >= 8 || trauma || bleeding || infection) {
      return "urgent";
    }
    
    // Moderate urgency indicators
    if (painLevel >= 5 || swelling || formData.painDuration === "days") {
      return "moderate";
    }
    
    // Low urgency
    return "low";
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "urgent":
        return "bg-red-50 border-red-200 text-red-800";
      case "moderate":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "low":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.painLevel > 0;
      case 2:
        return formData.painDuration !== "";
      case 3:
        return formData.symptoms.trim() !== "";
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center space-x-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step <= currentStep
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              )}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={cn(
                  "w-12 h-1 mx-2",
                  step < currentStep ? "bg-primary" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Pain Level */}
      {currentStep === 1 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span>Current Pain Level</span>
            </CardTitle>
            <p className="text-gray-600">
              Rate your pain on a scale of 1-10 (1 = mild discomfort, 10 = severe pain)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, painLevel: level })}
                  className={cn(
                    "w-12 h-12 rounded-lg border-2 flex items-center justify-center font-medium text-sm transition-all",
                    formData.painLevel === level
                      ? level <= 3
                        ? "bg-green-500 text-white border-green-500"
                        : level <= 6
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : "bg-red-500 text-white border-red-500"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            
            {formData.painLevel > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-700">
                  Pain Level: {formData.painLevel}/10 - {" "}
                  {formData.painLevel <= 3 ? "Mild" : 
                   formData.painLevel <= 6 ? "Moderate" : "Severe"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Duration */}
      {currentStep === 2 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>How long have you had this pain?</span>
            </CardTitle>
            <p className="text-gray-600">
              This helps us understand the urgency of your situation
            </p>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.painDuration}
              onValueChange={(value) => setFormData({ ...formData, painDuration: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hours" id="hours" />
                <Label htmlFor="hours">A few hours</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="today" id="today" />
                <Label htmlFor="today">Started today</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="days" id="days" />
                <Label htmlFor="days">Several days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weeks" id="weeks" />
                <Label htmlFor="weeks">More than a week</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chronic" id="chronic" />
                <Label htmlFor="chronic">Ongoing/chronic issue</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Symptoms */}
      {currentStep === 3 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Describe your symptoms</span>
            </CardTitle>
            <p className="text-gray-600">
              Please describe what you're experiencing in your own words
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., Sharp pain when biting, throbbing toothache, swollen gums..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="min-h-[100px]"
            />
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Are you experiencing any of these symptoms?
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="swelling"
                    checked={formData.swelling}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, swelling: checked as boolean })
                    }
                  />
                  <Label htmlFor="swelling" className="text-sm">Swelling</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trauma"
                    checked={formData.trauma}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, trauma: checked as boolean })
                    }
                  />
                  <Label htmlFor="trauma" className="text-sm">Recent injury/trauma</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bleeding"
                    checked={formData.bleeding}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, bleeding: checked as boolean })
                    }
                  />
                  <Label htmlFor="bleeding" className="text-sm">Bleeding</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="infection"
                    checked={formData.infection}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, infection: checked as boolean })
                    }
                  />
                  <Label htmlFor="infection" className="text-sm">Signs of infection</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Additional Notes */}
      {currentStep === 4 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <p className="text-gray-600">
              Anything else you'd like the dentist to know? (Optional)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., Medications you're taking, previous dental work, specific concerns..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className="min-h-[80px]"
            />
            
            {/* Urgency Preview */}
            <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <h4 className="font-medium mb-2">Assessment Summary:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Pain Level: {formData.painLevel}/10</Badge>
                  <Badge variant="outline">Duration: {formData.painDuration}</Badge>
                </div>
                <Badge className={getUrgencyColor(calculateUrgencyLevel())}>
                  {calculateUrgencyLevel().toUpperCase()} Priority
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex items-center space-x-2"
        >
          <span>{currentStep === 4 ? "Continue to Booking" : "Next"}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}