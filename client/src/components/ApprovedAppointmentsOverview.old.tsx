import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, Clock, User, Phone, Mail, FileText, AlertCircle, MapPin, Activity, Heart, TrendingUp, Info } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { PatientDetailsModal } from "./PatientDetailsModal";

interface ApprovedBooking {
  id: number;
  userId: number;
  appointmentId: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  appointment: {
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    treatmentType: string;
  };
  triageAssessment?: {
    id: number;
    painLevel: number;
    painDuration: string;
    symptoms: string;
    swelling: boolean;
    trauma: boolean;
    bleeding: boolean;
    infection: boolean;
    urgencyLevel: string;
    triageNotes: string;
  };
  status: string;
  approvalStatus: string;
  approvedAt: string;
  createdAt: string;
  specialRequests?: string;
  treatmentCategory: string;
  accessibilityNeeds?: string;
  medications: boolean;
  allergies: boolean;
  lastDentalVisit?: string;
  anxietyLevel: string;
}

interface ApprovedAppointmentsOverviewProps {
  practiceId: number;
}

export function ApprovedAppointmentsOverview({ practiceId }: ApprovedAppointmentsOverviewProps) {
  const [selectedBooking, setSelectedBooking] = useState<ApprovedBooking | null>(null);


  const { data: approvedBookings = [], isLoading } = useQuery<ApprovedBooking[]>({
    queryKey: [`/api/practice/${practiceId}/approved-bookings`],
    queryFn: async () => {
      const response = await fetch(`/api/practice/${practiceId}/approved-bookings`);
      if (!response.ok) throw new Error('Failed to fetch approved bookings');
      return response.json();
    }
  });

  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return approvedBookings.filter(booking => 
      new Date(booking.appointment.appointmentDate).toISOString().split('T')[0] === today
    );
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return approvedBookings.filter(booking => 
      new Date(booking.appointment.appointmentDate).toISOString().split('T')[0] > today
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnxietyColor = (anxietyLevel: string) => {
    switch (anxietyLevel) {
      case 'anxious':
        return 'bg-red-100 text-red-800';
      case 'nervous':
        return 'bg-yellow-100 text-yellow-800';
      case 'comfortable':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  const todaysAppointments = getTodaysAppointments();
  const upcomingAppointments = getUpcomingAppointments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Today's Appointments</span>
          </CardTitle>
          <CardDescription>
            {todaysAppointments.length} appointment{todaysAppointments.length !== 1 ? 's' : ''} scheduled for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todaysAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysAppointments
                .sort((a, b) => a.appointment.appointmentTime.localeCompare(b.appointment.appointmentTime))
                .map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {booking.user.firstName} {booking.user.lastName}
                            </span>
                            <Badge className={getAnxietyColor(booking.anxietyLevel)}>
                              {booking.anxietyLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{booking.appointment.treatmentType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{booking.appointment.appointmentTime}</p>
                        <p className="text-sm text-gray-600">{booking.appointment.duration} min</p>
                      </div>
                    </div>
                    
                    {/* Patient Summary */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{booking.user.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="truncate">{booking.user.email}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${booking.medications ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                          <span>{booking.medications ? 'Has medications' : 'No medications'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${booking.allergies ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          <span>{booking.allergies ? 'Has allergies' : 'No allergies'}</span>
                        </div>
                        <div className="text-gray-600">
                          <span>Last visit: {booking.lastDentalVisit || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Triage Information */}
                    {booking.triageAssessment && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-yellow-900 flex items-center text-sm">
                            <Heart className="h-4 w-4 mr-2" />
                            Triage Summary
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTriageExpansion(booking.id)}
                            className="h-6 px-2 text-xs"
                          >
                            {expandedTriage.has(booking.id) ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                More
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {/* Always visible summary */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-3 w-3 text-red-500" />
                            <span>Pain: {booking.triageAssessment.painLevel}/10</span>
                          </div>
                          <div>
                            <Badge className={getUrgencyColor(booking.triageAssessment.urgencyLevel)}>
                              {booking.triageAssessment.urgencyLevel} priority
                            </Badge>
                          </div>
                        </div>

                        {/* Expandable detailed triage */}
                        {expandedTriage.has(booking.id) && (
                          <div className="mt-3 pt-3 border-t border-yellow-200">
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">Duration:</span>
                                <span className="ml-2 font-medium">{booking.triageAssessment.painDuration}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Symptoms:</span>
                                <p className="mt-1 font-medium">{booking.triageAssessment.symptoms}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Clinical Indicators:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {booking.triageAssessment.swelling && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Swelling</Badge>
                                  )}
                                  {booking.triageAssessment.trauma && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Trauma</Badge>
                                  )}
                                  {booking.triageAssessment.bleeding && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Bleeding</Badge>
                                  )}
                                  {booking.triageAssessment.infection && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Infection</Badge>
                                  )}
                                  {(!booking.triageAssessment.swelling && !booking.triageAssessment.trauma && 
                                    !booking.triageAssessment.bleeding && !booking.triageAssessment.infection) && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">No acute symptoms</Badge>
                                  )}
                                </div>
                              </div>
                              {booking.triageAssessment.triageNotes && (
                                <div>
                                  <span className="text-gray-600">Notes:</span>
                                  <p className="mt-1 font-medium">{booking.triageAssessment.triageNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Special Requests
                        </h4>
                        <p className="text-sm text-gray-700">{booking.specialRequests}</p>
                      </div>
                    )}

                    {/* Accessibility Needs */}
                    {booking.accessibilityNeeds && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-3">
                        <h4 className="font-semibold text-purple-900 mb-2 text-sm">
                          Accessibility Requirements
                        </h4>
                        <p className="text-sm text-purple-700">{booking.accessibilityNeeds}</p>
                      </div>
                    )}

                    {(booking.specialRequests || booking.medications || booking.allergies) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Important Notes</span>
                        </div>
                        <div className="text-sm text-yellow-700 space-y-1">
                          {booking.medications && <p>• Patient takes medications</p>}
                          {booking.allergies && <p>• Patient has allergies</p>}
                          {booking.specialRequests && <p>• Special requests: {booking.specialRequests}</p>}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Upcoming Appointments</span>
          </CardTitle>
          <CardDescription>
            {upcomingAppointments.length} upcoming appointment{upcomingAppointments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments
                .sort((a, b) => new Date(a.appointment.appointmentDate).getTime() - new Date(b.appointment.appointmentDate).getTime())
                .slice(0, 5)
                .map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {booking.user.firstName} {booking.user.lastName}
                            </span>
                            <Badge className={getAnxietyColor(booking.anxietyLevel)}>
                              {booking.anxietyLevel}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {booking.treatmentCategory}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{booking.appointment.treatmentType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">
                          {format(new Date(booking.appointment.appointmentDate), 'MMM d')}
                        </p>
                        <p className="text-sm text-gray-600">{booking.appointment.appointmentTime}</p>
                      </div>
                    </div>
                    
                    {/* Patient Summary */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{booking.user.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="truncate">{booking.user.email}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${booking.medications ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                          <span>{booking.medications ? 'Has medications' : 'No medications'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${booking.allergies ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          <span>{booking.allergies ? 'Has allergies' : 'No allergies'}</span>
                        </div>
                        <div className="text-gray-600">
                          <span>Last visit: {booking.lastDentalVisit || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Triage Information */}
                    {booking.triageAssessment && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-yellow-900 flex items-center text-sm">
                            <Heart className="h-4 w-4 mr-2" />
                            Triage Summary
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTriageExpansion(booking.id)}
                            className="h-6 px-2 text-xs"
                          >
                            {expandedTriage.has(booking.id) ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                More
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {/* Always visible summary */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-3 w-3 text-red-500" />
                            <span>Pain: {booking.triageAssessment.painLevel}/10</span>
                          </div>
                          <div>
                            <Badge className={getUrgencyColor(booking.triageAssessment.urgencyLevel)}>
                              {booking.triageAssessment.urgencyLevel} priority
                            </Badge>
                          </div>
                        </div>

                        {/* Expandable detailed triage */}
                        {expandedTriage.has(booking.id) && (
                          <div className="mt-3 pt-3 border-t border-yellow-200">
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">Duration:</span>
                                <span className="ml-2 font-medium">{booking.triageAssessment.painDuration}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Symptoms:</span>
                                <p className="mt-1 font-medium">{booking.triageAssessment.symptoms}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Clinical Indicators:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {booking.triageAssessment.swelling && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Swelling</Badge>
                                  )}
                                  {booking.triageAssessment.trauma && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Trauma</Badge>
                                  )}
                                  {booking.triageAssessment.bleeding && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Bleeding</Badge>
                                  )}
                                  {booking.triageAssessment.infection && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Infection</Badge>
                                  )}
                                  {(!booking.triageAssessment.swelling && !booking.triageAssessment.trauma && 
                                    !booking.triageAssessment.bleeding && !booking.triageAssessment.infection) && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">No acute symptoms</Badge>
                                  )}
                                </div>
                              </div>
                              {booking.triageAssessment.triageNotes && (
                                <div>
                                  <span className="text-gray-600">Notes:</span>
                                  <p className="mt-1 font-medium">{booking.triageAssessment.triageNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Special Requests
                        </h4>
                        <p className="text-sm text-gray-700">{booking.specialRequests}</p>
                      </div>
                    )}

                    {/* Accessibility Needs */}
                    {booking.accessibilityNeeds && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-3">
                        <h4 className="font-semibold text-purple-900 mb-2 text-sm">
                          Accessibility Requirements
                        </h4>
                        <p className="text-sm text-purple-700">{booking.accessibilityNeeds}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              {upcomingAppointments.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    View All ({upcomingAppointments.length - 5} more)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  ×
                </Button>
              </div>
              <p className="text-gray-600">
                {format(new Date(selectedBooking.appointment.appointmentDate), 'EEEE, MMMM d, yyyy')} at {selectedBooking.appointment.appointmentTime}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Appointment Details */}
              <div>
                <h3 className="font-semibold mb-3">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Treatment:</span>
                    <p className="font-medium">{selectedBooking.appointment.treatmentType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{selectedBooking.appointment.duration} minutes</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <p className="font-medium">{selectedBooking.treatmentCategory}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Anxiety Level:</span>
                    <Badge className={getAnxietyColor(selectedBooking.anxietyLevel)}>
                      {selectedBooking.anxietyLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div>
                <h3 className="font-semibold mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedBooking.user.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedBooking.user.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Dental Visit:</span>
                    <p className="font-medium">{selectedBooking.lastDentalVisit || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="font-semibold mb-3">Medical Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Medications:</span>
                    <p className="font-medium">{selectedBooking.medications ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Allergies:</span>
                    <p className="font-medium">{selectedBooking.allergies ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div>
                  <h3 className="font-semibold mb-3">Special Requests</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              )}

              {/* Accessibility Needs */}
              {selectedBooking.accessibilityNeeds && (
                <div>
                  <h3 className="font-semibold mb-3">Accessibility Needs</h3>
                  <p className="text-sm bg-blue-50 p-3 rounded-lg">
                    {selectedBooking.accessibilityNeeds}
                  </p>
                </div>
              )}

              {/* Booking History */}
              <div>
                <h3 className="font-semibold mb-3">Booking History</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Booking requested:</span>
                    <span>{format(new Date(selectedBooking.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved:</span>
                    <span>{format(new Date(selectedBooking.approvedAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}