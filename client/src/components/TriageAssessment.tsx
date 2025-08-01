import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { AlertTriangle, Phone, Info, AlertCircle, Clock, X } from "lucide-react";
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
  anxietyLevel: "none" | "mild" | "moderate" | "severe";
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  previousDentalTreatment: string;
  smokingStatus: "never" | "former" | "current";
  alcoholConsumption: "none" | "occasional" | "regular" | "excessive";
  pregnancyStatus: "not-applicable" | "not-pregnant" | "pregnant" | "trying";
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

  const [currentStep, setCurrentStep] = useState(1);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [showInfoBubble, setShowInfoBubble] = useState(false);
  const [showPainInfoBubble, setShowPainInfoBubble] = useState(false);

  // Show pain info bubble after 2 seconds on first step
  useEffect(() => {
    if (currentStep === 1) {
      const timer = setTimeout(() => {
        setShowPainInfoBubble(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Show medical info bubble after 3 seconds on medical history step
  useEffect(() => {
    if (currentStep === 3) {
      const timer = setTimeout(() => {
        setShowInfoBubble(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

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

    // Show emergency alert if emergency symptoms detected
    if (urgencyLevel === "emergency" && !showEmergencyAlert) {
      setShowEmergencyAlert(true);
      return;
    }

    const finalData = { ...formData, urgencyLevel };
    onComplete(finalData);
  };

  const handleEmergencyProceed = () => {
    const finalData = { ...formData, urgencyLevel: "emergency" as const };
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
    <>
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
          <div className="space-y-4 relative">
            {/* Pain Assessment Info Bubble - Positioned on left side */}
            {showPainInfoBubble && (
              <div className="absolute top-8 -left-80 z-20 w-72">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 rounded-xl p-5 shadow-xl backdrop-blur-sm animate-fade-in">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-2 shadow-sm">
                        <Info className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="text-sm font-semibold text-blue-900">Getting you the right care</h4>
                    </div>
                    <button
                      onClick={() => setShowPainInfoBubble(false)}
                      className="text-blue-400 hover:text-blue-600 transition-colors rounded-full p-1 hover:bg-blue-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed mb-3">
                    Your pain level helps us ensure you receive appropriate care and are matched with the right dental specialist for your condition.
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-blue-700">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Clinical assessment in progress</span>
                  </div>
                  {/* Speech bubble tail pointing to card */}
                  <div className="absolute top-6 -right-2 w-4 h-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-r border-b border-blue-200/60 transform rotate-45"></div>
                </div>
              </div>
            )}
            
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

            <div className="flex justify-between gap-4 px-2 pb-2">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1 sm:flex-none"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </Button>
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!isFormValid}
                className="flex-1 sm:flex-none"
              >
                Continue
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Clinical Indicators</Label>
              <p className="text-sm text-gray-600 mb-4">Please check all symptoms that apply</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex justify-between gap-4 px-2 pb-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                className="flex-1 sm:flex-none"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                className="flex-1 sm:flex-none"
              >
                Continue
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 relative">
            {/* Medical Safety Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">
                <i className="fas fa-info-circle mr-2"></i>
                The following medical information is required for your safety and to ensure proper treatment planning.
              </AlertDescription>
            </Alert>

            {/* Medical History Info Bubble - Positioned on left side */}
            {showInfoBubble && (
              <div className="absolute top-8 -left-80 z-20 w-72">
                <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/60 rounded-xl p-5 shadow-xl backdrop-blur-sm animate-fade-in">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-full p-2 shadow-sm">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="text-sm font-semibold text-teal-900">Time-saving tip!</h4>
                    </div>
                    <button
                      onClick={() => setShowInfoBubble(false)}
                      className="text-teal-400 hover:text-teal-600 transition-colors rounded-full p-1 hover:bg-teal-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-teal-800 leading-relaxed mb-3">
                    Completing this questionnaire now not only helps us match you with the right appointment, 
                    but also saves you time and hassle when you arrive at the practice - no more clipboards!
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-teal-700">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                    <span>Streamlining your visit</span>
                  </div>
                  {/* Speech bubble tail pointing to card */}
                  <div className="absolute top-6 -right-2 w-4 h-4 bg-gradient-to-br from-teal-50 to-teal-100/50 border-r border-b border-teal-200/60 transform rotate-45"></div>
                </div>
              </div>
            )}

            <div>
              <Label className="text-base font-medium">Anxiety Level Assessment</Label>
              <p className="text-sm text-gray-600 mb-4">How anxious do you feel about dental treatment?</p>
              <RadioGroup
                value={formData.anxietyLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, anxietyLevel: value as any }))}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="anxiety-none" />
                  <Label htmlFor="anxiety-none" className="text-sm">No anxiety</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mild" id="anxiety-mild" />
                  <Label htmlFor="anxiety-mild" className="text-sm">Mild anxiety</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="anxiety-moderate" />
                  <Label htmlFor="anxiety-moderate" className="text-sm">Moderate anxiety</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="severe" id="anxiety-severe" />
                  <Label htmlFor="anxiety-severe" className="text-sm">Severe anxiety</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Medical History *</Label>
              <p className="text-sm text-gray-600 mb-3">Select any conditions that apply to you (check all that apply)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'none', label: 'No medical conditions' },
                  { id: 'hypertension', label: 'High blood pressure' },
                  { id: 'diabetes', label: 'Diabetes' },
                  { id: 'heart-disease', label: 'Heart disease' },
                  { id: 'asthma', label: 'Asthma/Breathing problems' },
                  { id: 'arthritis', label: 'Arthritis' },
                  { id: 'cancer', label: 'Cancer (past or current)' },
                  { id: 'kidney-disease', label: 'Kidney disease' },
                  { id: 'liver-disease', label: 'Liver disease' },
                  { id: 'stroke', label: 'Stroke' },
                  { id: 'mental-health', label: 'Mental health conditions' },
                  { id: 'other', label: 'Other medical condition' }
                ].map((condition) => (
                  <div key={condition.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={condition.id}
                      checked={formData.medicalHistory.includes(condition.label)}
                      onCheckedChange={(checked) => {
                        if (condition.id === 'none') {
                          // If "none" is selected, clear all other selections
                          setFormData(prev => ({ 
                            ...prev, 
                            medicalHistory: checked ? condition.label : ''
                          }));
                        } else {
                          // If any other condition is selected, remove "none" and add/remove the condition
                          setFormData(prev => {
                            let conditions = prev.medicalHistory.split(', ').filter(c => c && c !== 'No medical conditions');
                            if (checked) {
                              conditions.push(condition.label);
                            } else {
                              conditions = conditions.filter(c => c !== condition.label);
                            }
                            return { 
                              ...prev, 
                              medicalHistory: conditions.length > 0 ? conditions.join(', ') : ''
                            };
                          });
                        }
                      }}
                    />
                    <Label htmlFor={condition.id} className="text-sm cursor-pointer">
                      {condition.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.medicalHistory.includes('Other medical condition') && (
                <div className="mt-3">
                  <Label htmlFor="otherMedical" className="text-sm">Please specify other medical condition:</Label>
                  <Input
                    id="otherMedical"
                    placeholder="Describe your medical condition"
                    className="mt-1"
                    onChange={(e) => {
                      const otherCondition = e.target.value;
                      setFormData(prev => {
                        let conditions = prev.medicalHistory.split(', ').filter(c => c && !c.startsWith('Other:'));
                        if (otherCondition.trim()) {
                          conditions = conditions.filter(c => c !== 'Other medical condition');
                          conditions.push(`Other: ${otherCondition}`);
                        }
                        return { 
                          ...prev, 
                          medicalHistory: conditions.join(', ')
                        };
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">Current Medications *</Label>
              <p className="text-sm text-gray-600 mb-3">Select any medications you're currently taking (check all that apply)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'none-meds', label: 'No current medications' },
                  { id: 'blood-pressure', label: 'Blood pressure medication' },
                  { id: 'diabetes-meds', label: 'Diabetes medication' },
                  { id: 'heart-meds', label: 'Heart medication' },
                  { id: 'blood-thinner', label: 'Blood thinner (Warfarin, Aspirin)' },
                  { id: 'pain-relief', label: 'Pain relief (Ibuprofen, Paracetamol)' },
                  { id: 'antibiotics', label: 'Antibiotics' },
                  { id: 'antidepressants', label: 'Antidepressants' },
                  { id: 'contraceptive', label: 'Contraceptive pill' },
                  { id: 'asthma-inhaler', label: 'Asthma inhaler' },
                  { id: 'supplements', label: 'Vitamins/Supplements' },
                  { id: 'other-meds', label: 'Other medication' }
                ].map((medication) => (
                  <div key={medication.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={medication.id}
                      checked={formData.currentMedications.includes(medication.label)}
                      onCheckedChange={(checked) => {
                        if (medication.id === 'none-meds') {
                          // If "none" is selected, clear all other selections
                          setFormData(prev => ({ 
                            ...prev, 
                            currentMedications: checked ? medication.label : ''
                          }));
                        } else {
                          // If any other medication is selected, remove "none" and add/remove the medication
                          setFormData(prev => {
                            let medications = prev.currentMedications.split(', ').filter(c => c && c !== 'No current medications');
                            if (checked) {
                              medications.push(medication.label);
                            } else {
                              medications = medications.filter(c => c !== medication.label);
                            }
                            return { 
                              ...prev, 
                              currentMedications: medications.length > 0 ? medications.join(', ') : ''
                            };
                          });
                        }
                      }}
                    />
                    <Label htmlFor={medication.id} className="text-sm cursor-pointer">
                      {medication.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.currentMedications.includes('Other medication') && (
                <div className="mt-3">
                  <Label htmlFor="otherMedication" className="text-sm">Please specify other medication:</Label>
                  <Input
                    id="otherMedication"
                    placeholder="Name and dosage of medication"
                    className="mt-1"
                    onChange={(e) => {
                      const otherMedication = e.target.value;
                      setFormData(prev => {
                        let medications = prev.currentMedications.split(', ').filter(c => c && !c.startsWith('Other:'));
                        if (otherMedication.trim()) {
                          medications = medications.filter(c => c !== 'Other medication');
                          medications.push(`Other: ${otherMedication}`);
                        }
                        return { 
                          ...prev, 
                          currentMedications: medications.join(', ')
                        };
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">Allergies *</Label>
              <p className="text-sm text-gray-600 mb-3">Select any allergies you have (check all that apply)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'no-allergies', label: 'No known allergies' },
                  { id: 'penicillin', label: 'Penicillin' },
                  { id: 'latex', label: 'Latex' },
                  { id: 'lidocaine', label: 'Lidocaine (local anesthetic)' },
                  { id: 'aspirin', label: 'Aspirin' },
                  { id: 'ibuprofen', label: 'Ibuprofen' },
                  { id: 'codeine', label: 'Codeine' },
                  { id: 'metal-allergy', label: 'Metal allergies (nickel, etc.)' },
                  { id: 'food-allergies', label: 'Food allergies' },
                  { id: 'seasonal', label: 'Seasonal allergies' },
                  { id: 'skin-allergies', label: 'Skin allergies/Eczema' },
                  { id: 'other-allergies', label: 'Other allergies' }
                ].map((allergy) => (
                  <div key={allergy.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={allergy.id}
                      checked={formData.allergies.includes(allergy.label)}
                      onCheckedChange={(checked) => {
                        if (allergy.id === 'no-allergies') {
                          // If "no allergies" is selected, clear all other selections
                          setFormData(prev => ({ 
                            ...prev, 
                            allergies: checked ? allergy.label : ''
                          }));
                        } else {
                          // If any other allergy is selected, remove "no allergies" and add/remove the allergy
                          setFormData(prev => {
                            let allergies = prev.allergies.split(', ').filter(c => c && c !== 'No known allergies');
                            if (checked) {
                              allergies.push(allergy.label);
                            } else {
                              allergies = allergies.filter(c => c !== allergy.label);
                            }
                            return { 
                              ...prev, 
                              allergies: allergies.length > 0 ? allergies.join(', ') : ''
                            };
                          });
                        }
                      }}
                    />
                    <Label htmlFor={allergy.id} className="text-sm cursor-pointer">
                      {allergy.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.allergies.includes('Other allergies') && (
                <div className="mt-3">
                  <Label htmlFor="otherAllergies" className="text-sm">Please specify other allergies:</Label>
                  <Input
                    id="otherAllergies"
                    placeholder="Describe your allergies"
                    className="mt-1"
                    onChange={(e) => {
                      const otherAllergy = e.target.value;
                      setFormData(prev => {
                        let allergies = prev.allergies.split(', ').filter(c => c && !c.startsWith('Other:'));
                        if (otherAllergy.trim()) {
                          allergies = allergies.filter(c => c !== 'Other allergies');
                          allergies.push(`Other: ${otherAllergy}`);
                        }
                        return { 
                          ...prev, 
                          allergies: allergies.join(', ')
                        };
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between gap-4 px-2 pb-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(2)}
                className="flex-1 sm:flex-none"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(4)}
                disabled={!formData.medicalHistory.trim() || !formData.currentMedications.trim() || !formData.allergies.trim()}
                className="flex-1 sm:flex-none"
              >
                Continue
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="previousDentalTreatment">Previous Dental Treatment Experience</Label>
              <p className="text-sm text-gray-600 mb-2">Describe your previous dental experiences</p>
              <Textarea
                id="previousDentalTreatment"
                placeholder="e.g., Regular cleanings, fillings, extractions, any complications, or 'First dental visit'"
                value={formData.previousDentalTreatment}
                onChange={(e) => setFormData(prev => ({ ...prev, previousDentalTreatment: e.target.value }))}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Smoking Status</Label>
              <RadioGroup
                value={formData.smokingStatus}
                onValueChange={(value) => setFormData(prev => ({ ...prev, smokingStatus: value as any }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="smoke-never" />
                  <Label htmlFor="smoke-never">Never smoked</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="former" id="smoke-former" />
                  <Label htmlFor="smoke-former">Former smoker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current" id="smoke-current" />
                  <Label htmlFor="smoke-current">Current smoker</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Alcohol Consumption</Label>
              <RadioGroup
                value={formData.alcoholConsumption}
                onValueChange={(value) => setFormData(prev => ({ ...prev, alcoholConsumption: value as any }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="alcohol-none" />
                  <Label htmlFor="alcohol-none">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="occasional" id="alcohol-occasional" />
                  <Label htmlFor="alcohol-occasional">Occasional (1-2 drinks/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="alcohol-regular" />
                  <Label htmlFor="alcohol-regular">Regular (3-14 drinks/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excessive" id="alcohol-excessive" />
                  <Label htmlFor="alcohol-excessive">Excessive (&gt;14 drinks/week)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Pregnancy Status</Label>
              <RadioGroup
                value={formData.pregnancyStatus}
                onValueChange={(value) => setFormData(prev => ({ ...prev, pregnancyStatus: value as any }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-applicable" id="preg-na" />
                  <Label htmlFor="preg-na">Not applicable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-pregnant" id="preg-no" />
                  <Label htmlFor="preg-no">Not pregnant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pregnant" id="preg-yes" />
                  <Label htmlFor="preg-yes">Pregnant</Label>
                </div>
              </RadioGroup>
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

              {/* Emergency Protocol Alert - shown for emergency symptoms */}
              {(formData.bleeding || formData.trauma || formData.painLevel >= 8) && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="space-y-3 text-red-800">
                      <p className="font-semibold">Emergency symptoms detected - immediate action recommended:</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Call NHS 111 immediately</p>
                            <p className="text-xs">Available 24/7 for urgent dental triage</p>
                          </div>
                        </div>
                        
                        {formData.bleeding && (
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Active bleeding detected</p>
                              <p className="text-xs">Apply pressure with clean gauze and seek immediate care</p>
                            </div>
                          </div>
                        )}
                        
                        {formData.trauma && (
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Dental trauma reported</p>
                              <p className="text-xs">Visit A&E if tooth is knocked out or severe facial injury</p>
                            </div>
                          </div>
                        )}
                        
                        {formData.painLevel >= 8 && (
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Severe pain level ({formData.painLevel}/10)</p>
                              <p className="text-xs">May indicate abscess or serious infection requiring urgent care</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white rounded p-2 border border-red-200">
                        <p className="text-xs font-medium text-red-700">
                          You can still book through DentConnect, but we strongly recommend seeking 
                          immediate emergency care first.
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-between gap-4 px-2 pb-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(3)}
                className="flex-1 sm:flex-none"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 sm:flex-none"
              >
                Complete Assessment
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Emergency Protocol Alert Dialog */}
    <Dialog open={showEmergencyAlert} onOpenChange={setShowEmergencyAlert}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Emergency Symptoms Detected</span>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <p className="font-semibold mb-2">Based on your symptoms, you may need immediate medical attention.</p>
                  <p>You reported one or more of the following:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {formData.painLevel >= 8 && <li>Severe pain (level 8 or higher)</li>}
                    {formData.bleeding && <li>Active bleeding</li>}
                    {formData.trauma && <li>Recent dental trauma or injury</li>}
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Recommended Actions:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>
                    <strong>Call NHS 111</strong> for immediate triage advice
                    <p className="ml-5 text-xs mt-1">Available 24/7 for urgent medical guidance</p>
                  </li>
                  <li>
                    <strong>Visit A&E</strong> if experiencing:
                    <ul className="list-disc list-inside ml-5 mt-1 text-xs">
                      <li>Uncontrollable bleeding</li>
                      <li>Severe facial swelling</li>
                      <li>Difficulty breathing or swallowing</li>
                      <li>High fever with dental pain</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Contact your dental practice</strong> for emergency appointments
                    <p className="ml-5 text-xs mt-1">Many practices have emergency slots available</p>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Why this recommendation?</p>
                    <p className="mt-1">
                      Severe dental pain, bleeding, or trauma can indicate serious conditions that require 
                      immediate professional assessment. Early intervention can prevent complications and 
                      provide faster pain relief.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEmergencyAlert(false)}
                  className="flex-1"
                >
                  Cancel Booking
                </Button>
                <Button
                  onClick={handleEmergencyProceed}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Continue Anyway
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
    </>
  );
}