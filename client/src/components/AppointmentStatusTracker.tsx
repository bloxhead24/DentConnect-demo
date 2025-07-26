import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  MapPin, 
  Phone,
  Navigation,
  Activity
} from "lucide-react";
import type { Practice, Dentist } from "@shared/schema";

interface BookingStatus {
  id: number;
  userId: number;
  appointmentId: number;
  status: string;
  approvalStatus: string;
  approvedAt?: string;
  createdAt: string;
  appointment: {
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    treatmentType: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface AppointmentStatusTrackerProps {
  userId: number;
  practice: Practice;
  onBack: () => void;
}

export function AppointmentStatusTracker({ userId, practice, onBack }: AppointmentStatusTrackerProps) {
  const [currentBooking, setCurrentBooking] = useState<BookingStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  // Query to get user's bookings for this practice
  const { data: userBookings, refetch } = useQuery({
    queryKey: [`/api/users/${userId}/bookings`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/bookings`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    refetchInterval: isPolling ? 3000 : false, // Poll every 3 seconds while waiting
    enabled: !!userId
  });

  // Query to get dentist details for approved bookings
  const { data: dentistData } = useQuery({
    queryKey: [`/api/dentists/practice/${practice.id}`],
    enabled: !!practice.id && currentBooking?.approvalStatus === 'approved'
  });

  useEffect(() => {
    if (userBookings?.length > 0) {
      // Find the most recent booking for this practice
      const latestBooking = userBookings
        .filter((booking: any) => booking.practice?.id === practice.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      if (latestBooking) {
        // Transform the booking data to match expected structure
        const transformedBooking = {
          id: latestBooking.id,
          userId: latestBooking.userId,
          appointmentId: latestBooking.appointmentId,
          status: latestBooking.status,
          approvalStatus: latestBooking.approvalStatus,
          approvedAt: latestBooking.approvedAt,
          createdAt: latestBooking.createdAt,
          appointment: {
            appointmentDate: latestBooking.appointment.appointmentDate,
            appointmentTime: latestBooking.appointment.appointmentTime,
            duration: latestBooking.appointment.duration,
            treatmentType: latestBooking.appointment.treatmentType,
          },
          user: {
            firstName: latestBooking.user.firstName,
            lastName: latestBooking.user.lastName,
            email: latestBooking.user.email,
            phone: latestBooking.user.phone,
          }
        };
        
        setCurrentBooking(transformedBooking);
        
        // Stop polling if booking is approved or rejected
        if (latestBooking.approvalStatus === 'approved' || latestBooking.approvalStatus === 'rejected') {
          setIsPolling(false);
        }
      }
    }
  }, [userBookings, practice.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-white" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-white" />;
      default:
        return <Clock className="h-6 w-6 text-white animate-pulse" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          title: "Appointment Confirmed!",
          message: "Your appointment has been approved by the dentist.",
          color: "text-green-600"
        };
      case 'rejected':
        return {
          title: "Appointment Not Available",
          message: "Sorry, this appointment slot is no longer available. Please try booking another slot.",
          color: "text-red-600"
        };
      default:
        return {
          title: "Reviewing Your Request",
          message: "The dentist is reviewing your booking request and medical assessment. You'll be notified once approved.",
          color: "text-blue-600"
        };
    }
  };

  const getLoadingMessages = () => {
    const messages = [
      "Reviewing your medical assessment...",
      "Checking appointment availability...",
      "Notifying the dentist...",
      "Processing your booking request...",
      "Almost ready to confirm..."
    ];
    return messages;
  };

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (isPolling && currentBooking?.approvalStatus === 'pending') {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % getLoadingMessages().length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPolling, currentBooking?.approvalStatus]);

  const handleNavigateToAppointment = () => {
    // Open Google Maps with practice address
    const address = encodeURIComponent(practice.address);
    window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
  };

  const handleCallPractice = () => {
    window.open(`tel:${practice.phone}`, '_self');
  };

  if (!currentBooking) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>No Recent Bookings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              No booking requests found for this practice.
            </p>
            <Button onClick={onBack} className="w-full">
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusMessage(currentBooking.approvalStatus);
  const assignedDentist = dentistData?.find((d: Dentist) => d.id === 1); // Assume Dr. Richard for now

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Enhanced Status Header */}
      <Card className={cn(
        "border-2 overflow-hidden",
        currentBooking.approvalStatus === 'approved' ? "border-green-200 bg-gradient-to-br from-green-50 to-green-100" :
        currentBooking.approvalStatus === 'rejected' ? "border-red-200 bg-gradient-to-br from-red-50 to-red-100" :
        "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
      )}>
        <CardHeader className="text-center relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-repeat bg-center" 
                 style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className={cn(
                "p-4 rounded-full shadow-lg",
                currentBooking.approvalStatus === 'approved' ? "bg-green-500" :
                currentBooking.approvalStatus === 'rejected' ? "bg-red-500" :
                "bg-blue-500"
              )}>
                {getStatusIcon(currentBooking.approvalStatus)}
              </div>
            </div>
            <CardTitle className={cn("text-xl sm:text-2xl font-bold", statusInfo.color)}>
              {statusInfo.title}
            </CardTitle>
            <p className="text-gray-700 mt-3 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              {statusInfo.message}
            </p>
            
            {/* Loading Animation for Pending */}
            {currentBooking.approvalStatus === 'pending' && isPolling && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                <p className="text-blue-600 text-sm font-medium animate-pulse">
                  {getLoadingMessages()[currentMessageIndex]}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>



      {/* Enhanced Appointment Details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Appointment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-gray-600 text-sm font-medium">Date</span>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="font-semibold text-gray-900">
                  {format(new Date(currentBooking.appointment.appointmentDate), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-gray-600 text-sm font-medium">Time</span>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <p className="font-semibold text-gray-900">{currentBooking.appointment.appointmentTime}</p>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-gray-600 text-sm font-medium">Duration</span>
              <p className="font-semibold text-gray-900">{currentBooking.appointment.duration} minutes</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-600 text-sm font-medium">Treatment Type</span>
              <Badge variant="outline" className="font-medium capitalize">
                {currentBooking.appointment.treatmentType}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approved Appointment - Show Dentist and Navigation */}
      {currentBooking.approvalStatus === 'approved' && (
        <>
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Your Dentist</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-lg">Dr. Richard Thompson</h3>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      RCS Excellence 2025
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-1">General & Cosmetic Dentistry</p>
                  <p className="text-sm text-gray-500">25+ years experience</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Practice Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{practice.name}</p>
                <p className="text-gray-600">{practice.address}</p>
                <p className="text-gray-600">{practice.postcode}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleNavigateToAppointment}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCallPractice}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Practice
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Rejected Appointment - Show Retry Options */}
      {currentBooking.approvalStatus === 'rejected' && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Don't worry! There are other appointment slots available.
              </p>
              <Button 
                onClick={onBack}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Browse Other Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <Calendar className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
        
        {currentBooking.approvalStatus === 'pending' && (
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            Refresh Status
          </Button>
        )}
      </div>

      {/* Important Notes for Approved Appointments */}
      {currentBooking.approvalStatus === 'approved' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800 flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Appointment Preparation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="text-sm text-gray-700">
                <div className="flex items-center space-x-2 font-medium mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Please Bring With You:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-6">
                  <li>Photo ID (driving license or passport)</li>
                  <li>Current medications list</li>
                  <li>Previous dental records (if available)</li>
                  <li>Insurance details</li>
                </ul>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t">
                Please arrive 10 minutes early for check-in and preparation
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}