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
  Navigation
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
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-blue-500 animate-pulse" />;
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
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Status Header */}
      <Card className={cn(
        "border-2",
        currentBooking.approvalStatus === 'approved' ? "border-green-200 bg-green-50" :
        currentBooking.approvalStatus === 'rejected' ? "border-red-200 bg-red-50" :
        "border-blue-200 bg-blue-50"
      )}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon(currentBooking.approvalStatus)}
          </div>
          <CardTitle className={cn("text-xl", statusInfo.color)}>
            {statusInfo.title}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {statusInfo.message}
          </p>
        </CardHeader>
      </Card>

      {/* Loading Animation for Pending Status */}
      {currentBooking.approvalStatus === 'pending' && (
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-blue-600 font-medium animate-pulse">
                {getLoadingMessages()[currentMessageIndex]}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This usually takes 2-5 minutes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Appointment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">
                {format(new Date(currentBooking.appointment.appointmentDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{currentBooking.appointment.appointmentTime}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{currentBooking.appointment.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Treatment</p>
              <Badge variant="outline" className="capitalize">
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

      {/* Back Button for Pending Status */}
      {currentBooking.approvalStatus === 'pending' && (
        <Button 
          variant="outline" 
          onClick={onBack}
          className="w-full"
        >
          Back to Appointments
        </Button>
      )}
    </div>
  );
}