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
  const approvedBookings = allApprovedBookings.filter(booking => 
    booking.triageAssessment && 
    booking.triageAssessment.painLevel !== null &&
    booking.triageAssessment.symptoms &&
    booking.triageAssessment.urgencyLevel
  );

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