import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Heart, TrendingUp, Clock, AlertTriangle, Info } from "lucide-react";

interface PatientDetailsModalProps {
  booking: any;
  triggerButton?: React.ReactNode;
}

export function PatientDetailsModal({ booking, triggerButton }: PatientDetailsModalProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getAnxietyColor = (anxiety: string) => {
    switch (anxiety) {
      case 'severe':
        return 'bg-red-600 text-white';
      case 'moderate':
        return 'bg-orange-500 text-white';
      case 'mild':
        return 'bg-yellow-500 text-white';
      case 'none':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
      <Info className="h-3 w-3 mr-1" />
      View Details
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Patient Details - {booking.user.firstName} {booking.user.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{booking.user.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium">{booking.user.phone}</p>
              </div>
              <div>
                <span className="text-gray-600">Date of Birth:</span>
                <p className="font-medium">{booking.user.dateOfBirth}</p>
              </div>
              <div>
                <span className="text-gray-600">Booking Date:</span>
                <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Comprehensive Triage Assessment */}
          {booking.triageAssessment && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Comprehensive Triage Assessment
              </h3>
              
              <div className="space-y-4">
                {/* Step 1: Pain Assessment */}
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2">Step 1: Pain Assessment</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Pain Level:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <TrendingUp className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-lg">{booking.triageAssessment.painLevel}/10</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Pain Duration:</span>
                      <p className="font-medium">{booking.triageAssessment.painDuration}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">Symptoms Description:</span>
                    <p className="font-medium mt-1">{booking.triageAssessment.symptoms}</p>
                  </div>
                </div>

                {/* Step 2: Clinical Indicators */}
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2">Step 2: Clinical Indicators</h4>
                  <div className="flex flex-wrap gap-2">
                    {booking.triageAssessment.swelling && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />Swelling Present
                      </Badge>
                    )}
                    {booking.triageAssessment.trauma && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">Trauma Present</Badge>
                    )}
                    {booking.triageAssessment.bleeding && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">Bleeding Present</Badge>
                    )}
                    {booking.triageAssessment.infection && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">Infection Present</Badge>
                    )}
                    {(!booking.triageAssessment.swelling && !booking.triageAssessment.trauma && 
                      !booking.triageAssessment.bleeding && !booking.triageAssessment.infection) && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">No acute clinical indicators</Badge>
                    )}
                  </div>
                </div>

                {/* Step 3: Medical History & Anxiety */}
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2">Step 3: Medical History & Anxiety Assessment</h4>
                  
                  <div className="mb-3">
                    <span className="text-gray-600 text-sm">Anxiety Level:</span>
                    <div className="mt-1">
                      <Badge className={getAnxietyColor(booking.triageAssessment.anxietyLevel || 'none')}>
                        {booking.triageAssessment.anxietyLevel || 'none'}
                      </Badge>
                    </div>
                  </div>

                  {booking.triageAssessment.medicalHistory && (
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm">Medical History:</span>
                      <p className="font-medium mt-1">{booking.triageAssessment.medicalHistory}</p>
                    </div>
                  )}

                  {booking.triageAssessment.currentMedications && (
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm">Current Medications:</span>
                      <p className="font-medium mt-1">{booking.triageAssessment.currentMedications}</p>
                    </div>
                  )}

                  {booking.triageAssessment.allergies && (
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm">Allergies:</span>
                      <div className="mt-1 p-2 bg-red-50 rounded border-l-4 border-red-500">
                        <p className="font-medium text-red-700">{booking.triageAssessment.allergies}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4: Lifestyle Factors & Previous Experience */}
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2">Step 4: Lifestyle Factors & Previous Experience</h4>
                  
                  {booking.triageAssessment.previousDentalTreatment && (
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm">Previous Dental Experience:</span>
                      <p className="font-medium mt-1">{booking.triageAssessment.previousDentalTreatment}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-gray-600 text-sm">Smoking Status:</span>
                      <p className="font-medium">{booking.triageAssessment.smokingStatus || 'never'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Alcohol Consumption:</span>
                      <p className="font-medium">{booking.triageAssessment.alcoholConsumption || 'none'}</p>
                    </div>
                  </div>

                  {booking.triageAssessment.pregnancyStatus && booking.triageAssessment.pregnancyStatus !== 'not-applicable' && (
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm">Pregnancy Status:</span>
                      <p className="font-medium">{booking.triageAssessment.pregnancyStatus}</p>
                    </div>
                  )}
                </div>

                {/* Clinical Summary */}
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2">Clinical Summary</h4>
                  <div className="mb-3">
                    <span className="text-gray-600 text-sm">Urgency Assessment:</span>
                    <div className="mt-1">
                      <Badge className={getUrgencyColor(booking.triageAssessment.urgencyLevel)}>
                        {booking.triageAssessment.urgencyLevel} priority
                      </Badge>
                    </div>
                  </div>

                  {booking.triageAssessment.triageNotes && (
                    <div>
                      <span className="text-gray-600 text-sm">Clinical Notes:</span>
                      <p className="font-medium mt-1">{booking.triageAssessment.triageNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Care Preferences Section */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Care Preferences & Special Requirements
            </h3>
            
            <div className="space-y-3">
              {/* Medical Preferences */}
              {booking.triageAssessment && (booking.triageAssessment.currentMedications || booking.triageAssessment.allergies || booking.triageAssessment.medicalHistory) && (
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2 text-sm">Medical Information</h4>
                  <div className="space-y-2 text-sm">
                    {booking.triageAssessment.currentMedications && (
                      <div>
                        <span className="text-gray-600">Current Medications:</span>
                        <p className="font-medium text-blue-800 bg-blue-50 rounded px-2 py-1 mt-1">{booking.triageAssessment.currentMedications}</p>
                      </div>
                    )}
                    {booking.triageAssessment.allergies && (
                      <div>
                        <span className="text-gray-600">Allergies:</span>
                        <p className="font-medium text-red-800 bg-red-50 rounded px-2 py-1 mt-1">{booking.triageAssessment.allergies}</p>
                      </div>
                    )}
                    {booking.triageAssessment.medicalHistory && (
                      <div>
                        <span className="text-gray-600">Medical History:</span>
                        <p className="font-medium text-gray-800 bg-gray-50 rounded px-2 py-1 mt-1">{booking.triageAssessment.medicalHistory}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Anxiety & Comfort Preferences */}
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2 text-sm">Comfort & Anxiety Management</h4>
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-600 text-sm">Anxiety Level:</span>
                    <Badge className={getAnxietyColor(booking.triageAssessment?.anxietyLevel || booking.anxietyLevel)} variant="outline">
                      {booking.triageAssessment?.anxietyLevel || booking.anxietyLevel}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Last Dental Visit:</span>
                    <span className="font-medium ml-2">{booking.lastDentalVisit || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Accessibility & Special Requests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(booking.accessibilityNeeds || (booking.triageAssessment?.accessibilityNeeds?.length > 0)) && (
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2 text-sm">Accessibility Requirements</h4>
                    {booking.triageAssessment?.accessibilityNeeds?.length > 0 ? (
                      <div className="space-y-2">
                        {booking.triageAssessment.accessibilityNeeds.map((need: string) => {
                          const needMap: Record<string, { name: string; icon: string }> = {
                            wheelchair: { name: "Wheelchair Access", icon: "fas fa-wheelchair" },
                            signLanguage: { name: "Sign Language Support", icon: "fas fa-sign-language" },
                            visualSupport: { name: "Visual Support", icon: "fas fa-eye" },
                            cognitiveSupport: { name: "Cognitive Support", icon: "fas fa-brain" },
                            anxietySupport: { name: "Anxiety Support", icon: "fas fa-spa" },
                            hearingSupport: { name: "Hearing Support", icon: "fas fa-deaf" },
                            mobilitySupport: { name: "Mobility Support", icon: "fas fa-walking" },
                            noSpecialNeeds: { name: "No Special Requirements", icon: "fas fa-check-circle" }
                          };
                          const needInfo = needMap[need] || { name: need, icon: "fas fa-info-circle" };
                          return (
                            <div key={need} className="flex items-center space-x-2 text-sm bg-purple-50 rounded px-2 py-1">
                              <i className={`${needInfo.icon} text-purple-600`}></i>
                              <span className="text-gray-700">{needInfo.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 bg-purple-50 rounded px-2 py-1">{booking.accessibilityNeeds}</p>
                    )}
                  </div>
                )}
                
                {booking.specialRequests && (
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2 text-sm">Special Requests</h4>
                    <p className="text-sm text-gray-700 bg-green-50 rounded px-2 py-1">{booking.specialRequests}</p>
                  </div>
                )}
              </div>

              {/* Lifestyle Factors Badge Summary */}
              {booking.triageAssessment && (
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2 text-sm">Lifestyle Considerations</h4>
                  <div className="flex flex-wrap gap-2">
                    {booking.triageAssessment.smokingStatus !== 'never' && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {booking.triageAssessment.smokingStatus} smoker
                      </Badge>
                    )}
                    {booking.triageAssessment.alcoholConsumption !== 'none' && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {booking.triageAssessment.alcoholConsumption} alcohol use
                      </Badge>
                    )}
                    {booking.triageAssessment.pregnancyStatus === 'pregnant' && (
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        Expecting
                      </Badge>
                    )}
                    {booking.triageAssessment.pregnancyStatus === 'trying' && (
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        Trying to conceive
                      </Badge>
                    )}
                    {(!booking.triageAssessment.smokingStatus || booking.triageAssessment.smokingStatus === 'never') && 
                     (!booking.triageAssessment.alcoholConsumption || booking.triageAssessment.alcoholConsumption === 'none') && 
                     (!booking.triageAssessment.pregnancyStatus || booking.triageAssessment.pregnancyStatus === 'not-applicable') && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        No lifestyle concerns
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}