import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, FileText, Phone, Mail } from "lucide-react";
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
  triageAssessment: {
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
  createdAt: string;
  specialRequests?: string;
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

  // Group appointments by date
  const appointmentsByDate = availableAppointments.reduce((acc, appointment) => {
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
    // TODO: Implement approval logic
    console.log(`Approving booking ${bookingId}`);
  };

  const handleRejectBooking = async (bookingId: number) => {
    // TODO: Implement rejection logic
    console.log(`Rejecting booking ${bookingId}`);
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
                                  {appointment.status === 'available' ? 'Available' : 'Booked'}
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
                                      <div className="flex items-center space-x-3 mb-2">
                                        <User className="h-4 w-4 text-gray-600" />
                                        <span className="font-medium">
                                          {booking.user.firstName} {booking.user.lastName}
                                        </span>
                                        <Badge className={getUrgencyColor(booking.triageAssessment.urgencyLevel)}>
                                          {booking.triageAssessment.urgencyLevel} priority
                                        </Badge>
                                      </div>
                                      
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

                                      {/* Triage Assessment Summary */}
                                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <FileText className="h-4 w-4 text-gray-600" />
                                          <span className="font-medium text-sm">Clinical Assessment</span>
                                        </div>
                                        <div className="text-sm space-y-1">
                                          <div>
                                            <span className="text-gray-600">Pain Level:</span> {booking.triageAssessment.painLevel}/10
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Duration:</span> {booking.triageAssessment.painDuration}
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Symptoms:</span> {booking.triageAssessment.symptoms}
                                          </div>
                                          {booking.triageAssessment.triageNotes && (
                                            <div>
                                              <span className="text-gray-600">Notes:</span> {booking.triageAssessment.triageNotes}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {booking.specialRequests && (
                                        <div className="text-sm">
                                          <span className="text-gray-600">Special Requests:</span> {booking.specialRequests}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex space-x-2 ml-4">
                                      <Button
                                        size="sm"
                                        onClick={() => handleApproveBooking(booking.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRejectBooking(booking.id)}
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p>No bookings yet for this slot</p>
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