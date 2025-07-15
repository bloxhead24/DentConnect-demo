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
                      <Badge variant="outline" className="bg-red-50 text-red-700">Swelling Present</Badge>
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

          {/* Special Requests and Accessibility */}
          <div className="grid grid-cols-2 gap-4">
            {booking.specialRequests && (
              <div className="bg-purple-50 rounded-lg p-3">
                <h4 className="font-semibold text-purple-900 mb-2 text-sm">Special Requests</h4>
                <p className="text-sm">{booking.specialRequests}</p>
              </div>
            )}
            
            {booking.accessibilityNeeds && (
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Accessibility Needs</h4>
                <p className="text-sm">{booking.accessibilityNeeds}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}