import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, Clock, User, Mail, Phone, Activity, Heart, FileText, AlertTriangle, Shield, Stethoscope, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { PatientDetailsModal } from "./PatientDetailsModal";
import { useState } from "react";

interface ApprovedAppointmentsOverviewProps {
  practiceId: number;
}

interface TriageAssessment {
  id: number;
  painLevel: number;
  painDuration: string;
  symptoms: string;
  swelling: boolean;
  trauma: boolean;
  bleeding: boolean;
  infection: boolean;
  urgencyLevel: string;
  triageNotes?: string;
  anxietyLevel: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  previousDentalTreatment?: string;
  smokingStatus: string;
  alcoholConsumption: string;
  pregnancyStatus: string;
}

interface BookingUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

interface BookingAppointment {
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  treatmentType: string;
}

interface ApprovedBooking {
  id: number;
  userId: number;
  appointmentId: number;
  user: BookingUser;
  appointment: BookingAppointment;
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
  triageAssessment: TriageAssessment | null;
}

export function ApprovedAppointmentsOverview({ practiceId }: ApprovedAppointmentsOverviewProps) {
  const [expandedBookings, setExpandedBookings] = useState<Set<number>>(new Set());

  const toggleExpanded = (bookingId: number) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };
  const { data: allApprovedBookings = [], isLoading } = useQuery<ApprovedBooking[]>({
    queryKey: ["/api/practice", practiceId, "approved-bookings"],
    queryFn: async () => {
      const response = await fetch(`/api/practice/${practiceId}/approved-bookings`);
      if (!response.ok) throw new Error('Failed to fetch approved bookings');
      return response.json();
    }
  });

  // Filter to only show bookings with complete triage assessments
  const approvedBookings = allApprovedBookings.filter(booking => {
    console.log('Filtering booking:', booking.id, 'triageAssessment:', booking.triageAssessment);
    return booking.triageAssessment && 
           booking.triageAssessment.painLevel !== null &&
           booking.triageAssessment.symptoms &&
           booking.triageAssessment.urgencyLevel;
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

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return { color: 'bg-red-600 text-white border-red-600', icon: AlertTriangle, label: 'EMERGENCY' };
      case 'high':
        return { color: 'bg-orange-500 text-white border-orange-500', icon: AlertTriangle, label: 'HIGH' };
      case 'medium':
        return { color: 'bg-yellow-500 text-white border-yellow-500', icon: Activity, label: 'MEDIUM' };
      case 'low':
        return { color: 'bg-green-500 text-white border-green-500', icon: CheckCircle2, label: 'LOW' };
      default:
        return { color: 'bg-gray-500 text-white border-gray-500', icon: Activity, label: 'UNKNOWN' };
    }
  };

  const getPainLevelConfig = (painLevel: number) => {
    if (painLevel >= 8) return { color: 'bg-red-600 text-white', severity: 'Severe', icon: AlertTriangle };
    if (painLevel >= 6) return { color: 'bg-orange-500 text-white', severity: 'High', icon: Activity };
    if (painLevel >= 4) return { color: 'bg-yellow-500 text-white', severity: 'Moderate', icon: Activity };
    return { color: 'bg-green-500 text-white', severity: 'Mild', icon: CheckCircle2 };
  };

  const getAnxietyConfig = (anxiety: string) => {
    switch (anxiety) {
      case 'severe':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
      case 'moderate':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Activity };
      case 'mild':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Activity };
      case 'none':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Activity };
    }
  };

  const todaysAppointments = getTodaysAppointments();
  const upcomingAppointments = getUpcomingAppointments();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl animate-pulse border border-blue-100"></div>
        <div className="h-40 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl animate-pulse border border-teal-100"></div>
      </div>
    );
  }

  const AppointmentCard = ({ booking, isToday = false }: { booking: ApprovedBooking; isToday?: boolean }) => {
    if (!booking.triageAssessment) return null;
    
    const urgencyConfig = getUrgencyConfig(booking.triageAssessment.urgencyLevel);
    const painConfig = getPainLevelConfig(booking.triageAssessment.painLevel);
    const anxietyConfig = getAnxietyConfig(booking.triageAssessment.anxietyLevel);
    const UrgencyIcon = urgencyConfig.icon;
    const PainIcon = painConfig.icon;
    const AnxietyIcon = anxietyConfig.icon;
    const isExpanded = expandedBookings.has(booking.id);

    return (
      <div className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-xl ${
        isToday 
          ? 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 hover:border-blue-300' 
          : 'border-teal-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 hover:border-teal-300'
      }`}>
        {/* Urgency Header Strip */}
        <div className={`h-2 w-full ${urgencyConfig.color}`}></div>
        
        <div className="p-6">
          {/* Patient Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isToday ? 'bg-blue-100' : 'bg-teal-100'}`}>
                <User className={`h-6 w-6 ${isToday ? 'text-blue-600' : 'text-teal-600'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{booking.user.firstName} {booking.user.lastName}</h3>
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
                    <Stethoscope className="h-4 w-4 mr-1" />
                    {booking.appointment.treatmentType}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={() => toggleExpanded(booking.id)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1.5" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1.5" />
                    Show More
                  </>
                )}
              </Button>
              <PatientDetailsModal booking={booking} />
            </div>
          </div>

          {/* Summary View (Always Visible) */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quick Overview */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-red-600" />
                  Overview
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pain:</span>
                  <Badge className={`${painConfig.color} text-xs`}>
                    {booking.triageAssessment.painLevel}/10
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Urgency:</span>
                  <Badge className={`${urgencyConfig.color} text-xs`}>
                    {urgencyConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Care Preferences Summary */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-purple-600" />
                  Care Needs
                </h4>
                <div className="flex flex-wrap gap-1">
                  {booking.triageAssessment.currentMedications && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      Medications
                    </Badge>
                  )}
                  {booking.triageAssessment.allergies && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      Allergies
                    </Badge>
                  )}
                  {booking.accessibilityNeeds && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                      Accessibility
                    </Badge>
                  )}
                  {(!booking.triageAssessment.currentMedications && !booking.triageAssessment.allergies && !booking.accessibilityNeeds) && (
                    <span className="text-xs text-gray-500">No special needs</span>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Contact
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-gray-500" />
                    <span className="text-gray-700 truncate">{booking.user.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-1 text-gray-500" />
                    <span className="text-gray-700 truncate">{booking.user.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Clinical Summary Grid (Conditional) */}
          {isExpanded && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Pain Assessment */}
              <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center text-sm">
                    <PainIcon className="h-4 w-4 mr-2 text-red-600" />
                    Pain Assessment
                  </h4>
                  <Badge className={`${painConfig.color} text-xs`}>
                    {booking.triageAssessment.painLevel}/10
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Severity:</span>
                    <span className="font-medium text-gray-900">{painConfig.severity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{booking.triageAssessment.painDuration}</span>
                  </div>
                  {booking.triageAssessment.symptoms && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Symptoms:</p>
                      <p className="text-xs bg-gray-50 rounded p-2 line-clamp-2">{booking.triageAssessment.symptoms}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Clinical Indicators */}
              <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center text-sm">
                    <UrgencyIcon className="h-4 w-4 mr-2 text-orange-600" />
                    Clinical Status
                  </h4>
                  <Badge className={`${urgencyConfig.color} text-xs`}>
                    {urgencyConfig.label}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {booking.triageAssessment.swelling && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />Swelling
                    </Badge>
                  )}
                  {booking.triageAssessment.trauma && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />Trauma
                    </Badge>
                  )}
                  {booking.triageAssessment.bleeding && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />Bleeding
                    </Badge>
                  )}
                  {booking.triageAssessment.infection && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />Infection
                    </Badge>
                  )}
                  {!booking.triageAssessment.swelling && !booking.triageAssessment.trauma && 
                   !booking.triageAssessment.bleeding && !booking.triageAssessment.infection && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />No acute symptoms
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Anxiety Level:</span>
                    <Badge className={`${anxietyConfig.color} text-xs`} variant="outline">
                      <AnxietyIcon className="h-3 w-3 mr-1" />
                      {booking.triageAssessment.anxietyLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Care Preferences & Contact */}
              <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 p-4">
                <h4 className="font-semibold text-gray-900 flex items-center text-sm mb-3">
                  <Heart className="h-4 w-4 mr-2 text-purple-600" />
                  Care Preferences
                </h4>
                <div className="space-y-2 text-sm">
                  {/* Medical Information */}
                  {(booking.triageAssessment.currentMedications || booking.triageAssessment.allergies || booking.triageAssessment.medicalHistory) && (
                    <div className="space-y-1">
                      {booking.triageAssessment.currentMedications && (
                        <div className="text-xs">
                          <span className="text-gray-600">Medications:</span>
                          <span className="ml-1 bg-blue-50 text-blue-800 px-1 rounded text-xs">{booking.triageAssessment.currentMedications}</span>
                        </div>
                      )}
                      {booking.triageAssessment.allergies && (
                        <div className="text-xs">
                          <span className="text-gray-600">Allergies:</span>
                          <span className="ml-1 bg-red-50 text-red-800 px-1 rounded text-xs">{booking.triageAssessment.allergies}</span>
                        </div>
                      )}
                      {booking.triageAssessment.medicalHistory && (
                        <div className="text-xs">
                          <span className="text-gray-600">Medical History:</span>
                          <p className="text-xs bg-gray-50 rounded p-1 mt-1 line-clamp-2">{booking.triageAssessment.medicalHistory}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Accessibility Needs */}
                  {booking.accessibilityNeeds && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-xs">Accessibility:</span>
                      <p className="text-xs bg-purple-50 text-purple-800 rounded p-1 mt-1">{booking.accessibilityNeeds}</p>
                    </div>
                  )}

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-xs">Special Requests:</span>
                      <p className="text-xs bg-green-50 text-green-800 rounded p-1 mt-1 line-clamp-2">{booking.specialRequests}</p>
                    </div>
                  )}

                  {/* Clinical Notes */}
                  {booking.triageAssessment.triageNotes && (
                    <div className="border-t border-gray-200 pt-2 mt-3">
                      <p className="text-xs text-gray-600 mb-1">Clinical Notes:</p>
                      <p className="text-xs bg-gray-50 rounded p-2 line-clamp-2">{booking.triageAssessment.triageNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Treatment Category Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`${isToday ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-teal-100 text-teal-800 border-teal-200'} px-3 py-1`}>
              <FileText className="h-3 w-3 mr-1" />
              {booking.treatmentCategory} treatment
            </Badge>
            <div className="text-xs text-gray-500">
              Approved {format(new Date(booking.approvedAt), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Statistics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Today's Appointments</p>
                <p className="text-2xl font-bold text-blue-900">{todaysAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-teal-900">{upcomingAppointments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Approved</p>
                <p className="text-2xl font-bold text-purple-900">{approvedBookings.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Today's Appointments</h2>
          <Badge className="bg-blue-100 text-blue-800">{todaysAppointments.length}</Badge>
        </div>
        
        {todaysAppointments.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
              <p className="text-gray-500">All scheduled appointments with complete clinical assessments will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {todaysAppointments.map((booking) => (
              <AppointmentCard key={booking.id} booking={booking} isToday={true} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
          <Badge className="bg-teal-100 text-teal-800">{upcomingAppointments.length}</Badge>
        </div>
        
        {upcomingAppointments.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
              <p className="text-gray-500">Future appointments with complete clinical assessments will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {upcomingAppointments.map((booking) => (
              <AppointmentCard key={booking.id} booking={booking} isToday={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}