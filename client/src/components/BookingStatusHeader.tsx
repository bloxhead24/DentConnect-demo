import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, Clock, XCircle, Calendar, User, ExternalLink } from 'lucide-react';

interface BookingStatus {
  id: number;
  status: string;
  approvalStatus: string;
  appointment: {
    appointmentDate: string;
    appointmentTime: string;
    treatmentType: string;
  };
  practice: {
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

export function BookingStatusHeader() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const userId = sessionStorage.getItem('currentUserId');
    if (userId) {
      setCurrentUserId(parseInt(userId));
    }
  }, []);

  const { data: bookings = [] } = useQuery<BookingStatus[]>({
    queryKey: ['/api/users', currentUserId, 'bookings'],
    queryFn: async () => {
      if (!currentUserId) return [];
      const response = await fetch(`/api/users/${currentUserId}/bookings`);
      if (!response.ok) throw new Error('Failed to fetch user bookings');
      return response.json();
    },
    enabled: !!currentUserId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Get the most recent booking
  const latestBooking = bookings.length > 0 ? bookings[bookings.length - 1] : null;

  if (!latestBooking || !currentUserId) {
    return null;
  }

  const getStatusConfig = (approvalStatus: string) => {
    switch (approvalStatus) {
      case 'approved':
        return {
          icon: CheckCircle2,
          color: 'bg-green-500 text-white',
          text: 'Appointment Approved',
          description: 'Your appointment has been confirmed'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'bg-red-500 text-white',
          text: 'Appointment Declined',
          description: 'Please contact the practice for alternatives'
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          color: 'bg-amber-500 text-white',
          text: 'Awaiting Approval',
          description: 'Your booking is under review'
        };
    }
  };

  const statusConfig = getStatusConfig(latestBooking.approvalStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in-50 slide-in-from-top-4 duration-500">
      <Card className="border-2 shadow-xl backdrop-blur-md bg-white/95">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${statusConfig.color}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-sm truncate">{statusConfig.text}</p>
                <Badge variant="outline" className="text-xs">
                  {latestBooking.appointment.treatmentType}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 truncate">
                {statusConfig.description}
              </p>
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(latestBooking.appointment.appointmentDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{latestBooking.appointment.appointmentTime}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/booking-status')}
              className="ml-auto shrink-0 text-xs h-8 px-3 border-gray-300 hover:bg-gray-50"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}