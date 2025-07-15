import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { cn } from "../lib/utils";

interface TriageAssessmentProps {
  onComplete: (assessment: TriageAssessmentData) => void;
  onCancel: () => void;
}

export interface TriageAssessmentData {
  painLevel: number;
  painDuration: string;
  symptoms: string;
  swelling: boolean;
  trauma: boolean;
  bleeding: boolean;
  infection: boolean;
  urgencyLevel: "low" | "medium" | "high" | "emergency";
  triageNotes: string;
}

export function TriageAssessment({ onComplete, onCancel }: TriageAssessmentProps) {
  const [formData, setFormData] = useState<TriageAssessmentData>({
    painLevel: 0,
    painDuration: "",
    symptoms: "",
    swelling: false,
    trauma: false,
    bleeding: false,
    infection: false,
    urgencyLevel: "low",
    triageNotes: ""
  });

  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = () => {
    // Auto-calculate urgency level based on symptoms
    let urgencyLevel: "low" | "medium" | "high" | "emergency" = "low";
    
    if (formData.bleeding || formData.trauma || formData.painLevel >= 8) {
      urgencyLevel = "emergency";
    } else if (formData.infection || formData.swelling || formData.painLevel >= 6) {
      urgencyLevel = "high";
    } else if (formData.painLevel >= 4 || formData.painDuration.includes("days")) {
      urgencyLevel = "medium";
    }

    const finalData = { ...formData, urgencyLevel };
    onComplete(finalData);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      default: return "bg-green-500 text-white";
    }
  };

  const isFormValid = formData.painLevel > 0 && formData.symptoms.trim() !== "";

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <i className="fas fa-stethoscope text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold">Clinical Triage Assessment</h3>
            <p className="text-sm text-gray-600">Required for UK clinical governance compliance</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Pain Level Assessment</Label>
              <p className="text-sm text-gray-600 mb-3">Rate your current pain level (1 = minimal, 10 = severe)</p>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <Button
                    key={level}
                    variant={formData.painLevel === level ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-12 text-sm",
                      formData.painLevel === level && level <= 3 && "bg-green-500 hover:bg-green-600",
                      formData.painLevel === level && level > 3 && level <= 6 && "bg-yellow-500 hover:bg-yellow-600",
                      formData.painLevel === level && level > 6 && level <= 8 && "bg-orange-500 hover:bg-orange-600",
                      formData.painLevel === level && level > 8 && "bg-red-500 hover:bg-red-600"
                    )}
                    onClick={() => setFormData(prev => ({ ...prev, painLevel: level }))}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              {formData.painLevel >= 8 && (
                <Alert className="mt-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    High pain level detected. This appointment will require clinical approval.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="painDuration">Pain Duration</Label>
              <RadioGroup
                value={formData.painDuration}
                onValueChange={(value) => setFormData(prev => ({ ...prev, painDuration: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hours" id="hours" />
                  <Label htmlFor="hours">Less than 24 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-3 days" id="1-3days" />
                  <Label htmlFor="1-3days">1-3 days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3-7 days" id="3-7days" />
                  <Label htmlFor="3-7days">3-7 days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="over a week" id="week" />
                  <Label htmlFor="week">Over a week</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="symptoms">Describe Your Symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="Please describe your symptoms, including location, type of pain, and any triggers..."
                value={formData.symptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!isFormValid}
              >
                Continue to Clinical Indicators
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Clinical Indicators</Label>
              <p className="text-sm text-gray-600 mb-4">Please check all symptoms that apply</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="swelling"
                    checked={formData.swelling}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, swelling: !!checked }))}
                  />
                  <Label htmlFor="swelling" className="text-sm">Swelling</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trauma"
                    checked={formData.trauma}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, trauma: !!checked }))}
                  />
                  <Label htmlFor="trauma" className="text-sm">Recent trauma/injury</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bleeding"
                    checked={formData.bleeding}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bleeding: !!checked }))}
                  />
                  <Label htmlFor="bleeding" className="text-sm">Bleeding</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="infection"
                    checked={formData.infection}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, infection: !!checked }))}
                  />
                  <Label htmlFor="infection" className="text-sm">Signs of infection</Label>
                </div>
              </div>

              {(formData.bleeding || formData.trauma) && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Emergency indicators detected. This appointment requires immediate clinical approval.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="triageNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="triageNotes"
                placeholder="Any additional information that might be relevant for the dentist..."
                value={formData.triageNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, triageNotes: e.target.value }))}
                className="mt-2"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Calculated Urgency Level:</Label>
                  <Badge className={cn("ml-2", getUrgencyColor(
                    formData.bleeding || formData.trauma || formData.painLevel >= 8 ? "emergency" :
                    formData.infection || formData.swelling || formData.painLevel >= 6 ? "high" :
                    formData.painLevel >= 4 || formData.painDuration.includes("days") ? "medium" : "low"
                  ))}>
                    {formData.bleeding || formData.trauma || formData.painLevel >= 8 ? "EMERGENCY" :
                     formData.infection || formData.swelling || formData.painLevel >= 6 ? "HIGH" :
                     formData.painLevel >= 4 || formData.painDuration.includes("days") ? "MEDIUM" : "LOW"
                    }
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Complete Assessment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}