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
    <div className="fixed top-0 left-0 right-0 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-300">
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            {/* Status Icon and Info */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${statusConfig.color} shadow-sm`}>
                <StatusIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-sm text-gray-900">{statusConfig.text}</p>
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    {latestBooking.appointment.treatmentType}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {statusConfig.description}
                </p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="hidden sm:flex items-center space-x-6 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(latestBooking.appointment.appointmentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{latestBooking.appointment.appointmentTime}</span>
              </div>
              <div className="text-gray-400">•</div>
              <span className="font-medium text-gray-700">{latestBooking.practice.name}</span>
            </div>

            {/* Action Button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                console.log('BookingStatusHeader: Navigating to /booking-status');
                console.log('Current userId:', currentUserId);
                console.log('Latest booking:', latestBooking);
                setLocation('/booking-status');
              }}
              className="ml-4 shrink-0 text-xs h-8 px-4 bg-primary hover:bg-primary/90 text-white shadow-sm"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">Details</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}