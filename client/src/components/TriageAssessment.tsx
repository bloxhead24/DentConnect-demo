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
              <Button onClick={() => setCurrentStep(3)}>
                Continue to Medical History
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Medical Safety Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">
                <i className="fas fa-info-circle mr-2"></i>
                The following medical information is required for your safety and to ensure proper treatment planning.
              </AlertDescription>
            </Alert>

            <div>
              <Label className="text-base font-medium">Anxiety Level Assessment</Label>
              <p className="text-sm text-gray-600 mb-4">How anxious do you feel about dental treatment?</p>
              <RadioGroup
                value={formData.anxietyLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, anxietyLevel: value as any }))}
                className="grid grid-cols-2 gap-4"
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

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(4)}
                disabled={!formData.medicalHistory.trim() || !formData.currentMedications.trim() || !formData.allergies.trim()}
              >
                Continue to Lifestyle Factors
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="trying" id="preg-trying" />
                  <Label htmlFor="preg-trying">Trying to conceive</Label>
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
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
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