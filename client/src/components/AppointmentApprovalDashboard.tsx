import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, FileText, Phone, Mail, Activity, Heart, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";

interface PendingBooking {
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
    anxietyLevel: string;
    medicalHistory: string;
    currentMedications: string;
    allergies: string;
    previousDentalTreatment: string;
    smokingStatus: string;
    alcoholConsumption: string;
    pregnancyStatus: string;
  };
  status: string;
  approvalStatus: string;
  createdAt: string;
  treatmentCategory: string;
  specialRequests?: string;
  accessibilityNeeds?: string;
  medications: boolean;
  allergies: boolean;
  lastDentalVisit?: string;
  anxietyLevel: string;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  treatmentType: string;
  status: string;
}

interface AppointmentApprovalDashboardProps {
  practiceId: number;
}

export function AppointmentApprovalDashboard({ practiceId }: AppointmentApprovalDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: availableAppointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: [`/api/practice/${practiceId}/available-appointments`],
    queryFn: async () => {
      const response = await fetch(`/api/practice/${practiceId}/available-appointments`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    }
  });

  const { data: pendingBookings = [], isLoading: bookingsLoading } = useQuery<PendingBooking[]>({
    queryKey: [`/api/practice/${practiceId}/pending-bookings`],
    queryFn: async () => {
      const response = await fetch(`/api/practice/${practiceId}/pending-bookings`);
      if (!response.ok) throw new Error('Failed to fetch pending bookings');
      return response.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Dr. Richard Thompson' })
      });
      if (!response.ok) throw new Error('Failed to approve booking');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/practice/${practiceId}/pending-bookings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/practice/${practiceId}/available-appointments`] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedBy: 'Dr. Richard Thompson' })
      });
      if (!response.ok) throw new Error('Failed to reject booking');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/practice/${practiceId}/pending-bookings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/practice/${practiceId}/available-appointments`] });
    }
  });

  // Create all appointment slots (both available and those with pending bookings)
  const allAppointments = new Map<number, Appointment>();
  
  // Add available appointments
  availableAppointments.forEach(apt => {
    allAppointments.set(apt.id, apt);
  });
  
  // Add appointments from pending bookings (they might not be in available list)
  pendingBookings.forEach(booking => {
    if (!allAppointments.has(booking.appointmentId)) {
      allAppointments.set(booking.appointmentId, {
        id: booking.appointmentId,
        appointmentDate: booking.appointment.appointmentDate,
        appointmentTime: booking.appointment.appointmentTime,
        duration: booking.appointment.duration,
        treatmentType: booking.appointment.treatmentType,
        status: 'pending_approval'
      });
    }
  });

  // Group all appointments by date
  const appointmentsByDate = Array.from(allAppointments.values()).reduce((acc, appointment) => {
    const date = new Date(appointment.appointmentDate).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Group pending bookings by appointment
  const bookingsByAppointment = pendingBookings.reduce((acc, booking) => {
    const appointmentId = booking.appointmentId;
    if (!acc[appointmentId]) {
      acc[appointmentId] = [];
    }
    acc[appointmentId].push(booking);
    return acc;
  }, {} as Record<number, PendingBooking[]>);

  const handleApproveBooking = async (bookingId: number) => {
    console.log(`Approving booking ${bookingId}`);
    approveMutation.mutate(bookingId);
  };

  const handleRejectBooking = async (bookingId: number) => {
    console.log(`Rejecting booking ${bookingId}`);
    rejectMutation.mutate(bookingId);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (appointmentsLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment data...</p>
        </div>
      </div>
    );
  }

  const sortedDates = Object.keys(appointmentsByDate).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointment Approvals</h2>
          <p className="text-gray-600">Review and approve patient booking requests</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {pendingBookings.length} Pending Approvals
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {availableAppointments.length} Available Slots
          </Badge>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Appointments</h3>
            <p className="text-gray-600">Create appointment slots to start receiving booking requests from patients.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</span>
                </CardTitle>
                <CardDescription>
                  {appointmentsByDate[date].length} appointment slot{appointmentsByDate[date].length !== 1 ? 's' : ''} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointmentsByDate[date]
                    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                    .map((appointment) => {
                      const appointmentBookings = bookingsByAppointment[appointment.id] || [];
                      
                      return (
                        <div key={appointment.id} className="border rounded-lg p-4 bg-gray-50">
                          {/* Appointment Slot Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span className="font-medium">{appointment.appointmentTime}</span>
                                <Badge variant="outline" className={getStatusColor(appointment.status)}>
                                  {appointment.status === 'available' ? 'Available' : 'Pending'}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.duration} min • {appointment.treatmentType}
                              </div>
                            </div>
                            {appointmentBookings.length > 0 && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {appointmentBookings.length} booking{appointmentBookings.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>

                          {/* Patient Bookings */}
                          {appointmentBookings.length > 0 ? (
                            <div className="space-y-3">
                              {appointmentBookings.map((booking) => (
                                <div key={booking.id} className="bg-white rounded-lg p-4 border">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <User className="h-4 w-4 text-gray-600" />
                                        <span className="font-medium">
                                          {booking.user.firstName} {booking.user.lastName}
                                        </span>
                                        <Badge className={`${booking.anxietyLevel === 'anxious' ? 'bg-red-100 text-red-800' : 
                                          booking.anxietyLevel === 'nervous' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-green-100 text-green-800'}`}>
                                          {booking.anxietyLevel}
                                        </Badge>
                                        <Badge className="bg-blue-100 text-blue-800">
                                          {booking.treatmentCategory}
                                        </Badge>
                                      </div>

                                      {/* Care Preferences Summary */}
                                      {booking.triageAssessment && (
                                        <div className="bg-purple-50 rounded-lg p-3 mb-3">
                                          <h4 className="text-xs font-medium text-purple-800 mb-2">Care Preferences</h4>
                                          <div className="flex flex-wrap gap-1">
                                            {booking.triageAssessment.currentMedications && (
                                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                Medication: {booking.triageAssessment.currentMedications}
                                              </Badge>
                                            )}
                                            {booking.triageAssessment.allergies && (
                                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                                Allergies: {booking.triageAssessment.allergies}
                                              </Badge>
                                            )}
                                            {booking.accessibilityNeeds && (
                                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                                Accessibility needs
                                              </Badge>
                                            )}
                                            {booking.specialRequests && (
                                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                                Special requests
                                              </Badge>
                                            )}
                                            {booking.triageAssessment.smokingStatus !== 'never' && (
                                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                                {booking.triageAssessment.smokingStatus} smoker
                                              </Badge>
                                            )}
                                            {booking.triageAssessment.pregnancyStatus === 'pregnant' && (
                                              <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 text-xs">
                                                Expecting
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Patient Contact Info */}
                                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center space-x-2">
                                          <Mail className="h-4 w-4" />
                                          <span>{booking.user.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Phone className="h-4 w-4" />
                                          <span>{booking.user.phone}</span>
                                        </div>
                                      </div>

                                      {/* Clinical Information */}
                                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                                          <Activity className="h-4 w-4 mr-2" />
                                          Clinical Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <span className="text-gray-600">Medical History:</span>
                                            <div className="mt-1 space-y-1">
                                              <div className="flex items-center space-x-2">
                                                <span className={`w-2 h-2 rounded-full ${booking.medications ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                                                <span>{booking.medications ? 'Takes medications' : 'No medications'}</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className={`w-2 h-2 rounded-full ${booking.allergies ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                                <span>{booking.allergies ? 'Has allergies' : 'No allergies'}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Last Dental Visit:</span>
                                            <p className="font-medium">{booking.lastDentalVisit || 'Not specified'}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Triage Assessment */}
                                      {booking.triageAssessment && (
                                        <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                                          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                                            <Heart className="h-4 w-4 mr-2" />
                                            Triage Assessment
                                          </h4>
                                          <div className="space-y-3 text-sm">
                                            {/* Pain and Symptoms */}
                                            <div className="grid grid-cols-2 gap-3">
                                              <div>
                                                <span className="text-gray-600">Pain Level:</span>
                                                <div className="flex items-center space-x-2 mt-1">
                                                  <TrendingUp className="h-3 w-3 text-red-500" />
                                                  <span className="font-medium">{booking.triageAssessment.painLevel}/10</span>
                                                </div>
                                              </div>
                                              <div>
                                                <span className="text-gray-600">Duration:</span>
                                                <p className="font-medium">{booking.triageAssessment.painDuration}</p>
                                              </div>
                                            </div>
                                            
                                            {/* Anxiety Level */}
                                            <div>
                                              <span className="text-gray-600">Anxiety Level:</span>
                                              <Badge className={getAnxietyColor(booking.triageAssessment.anxietyLevel || 'none')}>
                                                {booking.triageAssessment.anxietyLevel || 'none'}
                                              </Badge>
                                            </div>

                                            <div>
                                              <span className="text-gray-600">Symptoms:</span>
                                              <p className="font-medium">{booking.triageAssessment.symptoms}</p>
                                            </div>
                                            
                                            {/* Clinical Indicators */}
                                            <div>
                                              <span className="text-gray-600">Clinical Indicators:</span>
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                {booking.triageAssessment.swelling && (
                                                  <Badge variant="outline" className="bg-red-50 text-red-700">Swelling</Badge>
                                                )}
                                                {booking.triageAssessment.trauma && (
                                                  <Badge variant="outline" className="bg-red-50 text-red-700">Trauma</Badge>
                                                )}
                                                {booking.triageAssessment.bleeding && (
                                                  <Badge variant="outline" className="bg-red-50 text-red-700">Bleeding</Badge>
                                                )}
                                                {booking.triageAssessment.infection && (
                                                  <Badge variant="outline" className="bg-red-50 text-red-700">Infection</Badge>
                                                )}
                                                {(!booking.triageAssessment.swelling && !booking.triageAssessment.trauma && 
                                                  !booking.triageAssessment.bleeding && !booking.triageAssessment.infection) && (
                                                  <Badge variant="outline" className="bg-green-50 text-green-700">No acute symptoms</Badge>
                                                )}
                                              </div>
                                            </div>

                                            {/* Medical History */}
                                            {booking.triageAssessment.medicalHistory && (
                                              <div>
                                                <span className="text-gray-600">Medical History:</span>
                                                <p className="font-medium">{booking.triageAssessment.medicalHistory}</p>
                                              </div>
                                            )}

                                            {/* Current Medications */}
                                            {booking.triageAssessment.currentMedications && (
                                              <div>
                                                <span className="text-gray-600">Current Medications:</span>
                                                <p className="font-medium">{booking.triageAssessment.currentMedications}</p>
                                              </div>
                                            )}

                                            {/* Allergies */}
                                            {booking.triageAssessment.allergies && (
                                              <div>
                                                <span className="text-gray-600">Allergies:</span>
                                                <p className="font-medium text-red-700">{booking.triageAssessment.allergies}</p>
                                              </div>
                                            )}

                                            {/* Previous Dental Treatment */}
                                            {booking.triageAssessment.previousDentalTreatment && (
                                              <div>
                                                <span className="text-gray-600">Previous Dental Experience:</span>
                                                <p className="font-medium">{booking.triageAssessment.previousDentalTreatment}</p>
                                              </div>
                                            )}

                                            {/* Lifestyle Factors */}
                                            <div className="grid grid-cols-2 gap-3">
                                              <div>
                                                <span className="text-gray-600">Smoking Status:</span>
                                                <p className="font-medium">{booking.triageAssessment.smokingStatus || 'never'}</p>
                                              </div>
                                              <div>
                                                <span className="text-gray-600">Alcohol:</span>
                                                <p className="font-medium">{booking.triageAssessment.alcoholConsumption || 'none'}</p>
                                              </div>
                                            </div>

                                            {/* Pregnancy Status */}
                                            {booking.triageAssessment.pregnancyStatus && booking.triageAssessment.pregnancyStatus !== 'not-applicable' && (
                                              <div>
                                                <span className="text-gray-600">Pregnancy Status:</span>
                                                <p className="font-medium">{booking.triageAssessment.pregnancyStatus}</p>
                                              </div>
                                            )}

                                            {/* Urgency */}
                                            <div>
                                              <span className="text-gray-600">Urgency:</span>
                                              <Badge className={getUrgencyColor(booking.triageAssessment.urgencyLevel)}>
                                                {booking.triageAssessment.urgencyLevel} priority
                                              </Badge>
                                            </div>

                                            {/* Triage Notes */}
                                            {booking.triageAssessment.triageNotes && (
                                              <div>
                                                <span className="text-gray-600">Additional Notes:</span>
                                                <p className="font-medium">{booking.triageAssessment.triageNotes}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Special Requests */}
                                      {booking.specialRequests && (
                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Special Requests
                                          </h4>
                                          <p className="text-sm text-gray-700">{booking.specialRequests}</p>
                                        </div>
                                      )}

                                      {/* Accessibility Needs */}
                                      {booking.accessibilityNeeds && (
                                        <div className="bg-purple-50 rounded-lg p-3 mb-3">
                                          <h4 className="font-semibold text-purple-900 mb-2">
                                            Accessibility Requirements
                                          </h4>
                                          <p className="text-sm text-purple-700">{booking.accessibilityNeeds}</p>
                                        </div>
                                      )}
                                      
                                      <div className="text-sm text-gray-600 mb-3">
                                        <strong>Submitted:</strong> {format(new Date(booking.createdAt), 'PPpp')}
                                      </div>
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleApproveBooking(booking.id)}
                                        disabled={approveMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRejectBooking(booking.id)}
                                        disabled={rejectMutation.isPending}
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p>No booking requests for this slot</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}