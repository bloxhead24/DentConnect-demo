import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, Clock, User, Phone, Mail, FileText, AlertCircle, MapPin, Activity, Heart, TrendingUp } from "lucide-react";
import { format } from "date-fns";
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
    anxietyLevel?: string;
    medicalHistory?: string;
    currentMedications?: string;
    allergies?: string;
    previousDentalTreatment?: string;
    smokingStatus?: string;
    alcoholConsumption?: string;
    pregnancyStatus?: string;
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
  const { data: approvedBookings = [], isLoading } = useQuery<ApprovedBooking[]>({
    queryKey: [`/api/practice/${practiceId}/approved-bookings`],
    queryFn: async () => {
      const res = await fetch(`/api/practice/${practiceId}/approved-bookings`);
      if (!res.ok) {
        throw new Error('Failed to fetch approved bookings');
      }
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getTodaysAppointments = () => {
    const today = new Date();
    return approvedBookings.filter(booking => {
      const appointmentDate = new Date(booking.appointment.appointmentDate);
      return appointmentDate.toDateString() === today.toDateString();
    });
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return approvedBookings.filter(booking => {
      const appointmentDate = new Date(booking.appointment.appointmentDate);
      return appointmentDate > today;
    });
  };

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
        return 'bg-red-600 text-white border-red-600';
      case 'moderate':
        return 'bg-orange-500 text-white border-orange-500';
      case 'mild':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'none':
        return 'bg-green-500 text-white border-green-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const todaysAppointments = getTodaysAppointments();
  const upcomingAppointments = getUpcomingAppointments();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Appointments
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
              {todaysAppointments.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.user.firstName} {booking.user.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {booking.appointment.appointmentTime}
                        </div>
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-1" />
                          {booking.appointment.duration} min
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {booking.appointment.treatmentType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getAnxietyColor(booking.anxietyLevel)}>
                        {booking.anxietyLevel} anxiety
                      </Badge>
                      <PatientDetailsModal booking={booking} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Contact Info */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center text-sm">
                        <User className="h-4 w-4 mr-2" />
                        Contact Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-2 text-blue-600" />
                          <span>{booking.user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2 text-blue-600" />
                          <span>{booking.user.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2 text-blue-600" />
                          <span>DOB: {booking.user.dateOfBirth}</span>
                        </div>
                      </div>
                    </div>

                    {/* Treatment Preferences */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Treatment Preferences
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Treatment:</span>
                          <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                            {booking.appointment.treatmentType}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Category:</span>
                          <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                            {booking.treatmentCategory}
                          </Badge>
                        </div>
                        {booking.accessibilityNeeds && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Accessibility:</span>
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                              Required
                            </Badge>
                          </div>
                        )}
                        {booking.specialRequests && (
                          <div className="mt-1">
                            <span className="text-gray-600 text-xs">Special Requests:</span>
                            <p className="text-xs text-gray-700 mt-1 bg-white rounded p-1 line-clamp-2">
                              {booking.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Triage Information */}
                    <div className="bg-red-50 rounded-lg p-3">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center text-sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Triage Information
                      </h4>
                      {booking.triageAssessment ? (
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Pain Level:</span>
                            <Badge className={booking.triageAssessment.painLevel >= 7 ? 'bg-red-600 text-white' : booking.triageAssessment.painLevel >= 4 ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}>
                              {booking.triageAssessment.painLevel}/10
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Urgency:</span>
                            <Badge className={getUrgencyColor(booking.triageAssessment.urgencyLevel)}>
                              {booking.triageAssessment.urgencyLevel}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {booking.triageAssessment.swelling && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Swelling</Badge>
                            )}
                            {booking.triageAssessment.trauma && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Trauma</Badge>
                            )}
                            {booking.triageAssessment.bleeding && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Bleeding</Badge>
                            )}
                            {booking.triageAssessment.infection && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Infection</Badge>
                            )}
                          </div>
                          <PatientDetailsModal booking={booking} />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          <p className="mb-2">No triage assessment available</p>
                          <PatientDetailsModal booking={booking} />
                        </div>
                      )}
                    </div>
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
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 mr-2" />
            Upcoming Appointments
          </CardTitle>
          <CardDescription>
            {upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? 's' : ''} scheduled for the future
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.user.firstName} {booking.user.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(booking.appointment.appointmentDate), 'PPP')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {booking.appointment.appointmentTime}
                        </div>
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-1" />
                          {booking.appointment.duration} min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getAnxietyColor(booking.anxietyLevel)}>
                        {booking.anxietyLevel} anxiety
                      </Badge>
                      <PatientDetailsModal booking={booking} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Contact Info */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center text-sm">
                        <User className="h-4 w-4 mr-2" />
                        Contact Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-2 text-blue-600" />
                          <span>{booking.user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2 text-blue-600" />
                          <span>{booking.user.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2 text-blue-600" />
                          <span>DOB: {booking.user.dateOfBirth}</span>
                        </div>
                      </div>
                    </div>

                    {/* Treatment Preferences */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Treatment Preferences
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Treatment:</span>
                          <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                            {booking.appointment.treatmentType}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Category:</span>
                          <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                            {booking.treatmentCategory}
                          </Badge>
                        </div>
                        {booking.accessibilityNeeds && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Accessibility:</span>
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                              Required
                            </Badge>
                          </div>
                        )}
                        {booking.specialRequests && (
                          <div className="mt-1">
                            <span className="text-gray-600 text-xs">Special Requests:</span>
                            <p className="text-xs text-gray-700 mt-1 bg-white rounded p-1 line-clamp-2">
                              {booking.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Triage Information */}
                    <div className="bg-red-50 rounded-lg p-3">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center text-sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Triage Information
                      </h4>
                      {booking.triageAssessment ? (
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Pain Level:</span>
                            <Badge className={booking.triageAssessment.painLevel >= 7 ? 'bg-red-600 text-white' : booking.triageAssessment.painLevel >= 4 ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}>
                              {booking.triageAssessment.painLevel}/10
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Urgency:</span>
                            <Badge className={getUrgencyColor(booking.triageAssessment.urgencyLevel)}>
                              {booking.triageAssessment.urgencyLevel}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {booking.triageAssessment.swelling && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Swelling</Badge>
                            )}
                            {booking.triageAssessment.trauma && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Trauma</Badge>
                            )}
                            {booking.triageAssessment.bleeding && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Bleeding</Badge>
                            )}
                            {booking.triageAssessment.infection && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Infection</Badge>
                            )}
                          </div>
                          <PatientDetailsModal booking={booking} />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          <p className="mb-2">No triage assessment available</p>
                          <PatientDetailsModal booking={booking} />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}