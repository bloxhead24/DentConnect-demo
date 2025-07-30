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
  const [animationKey, setAnimationKey] = useState(0);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

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

  // Trigger animation when status changes
  useEffect(() => {
    const currentStatus = latestBooking.approvalStatus;
    if (lastStatus && lastStatus !== currentStatus) {
      setAnimationKey(prev => prev + 1);
    }
    setLastStatus(currentStatus);
  }, [latestBooking.approvalStatus, lastStatus]);

  const statusConfig = getStatusConfig(latestBooking.approvalStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div 
      key={animationKey} 
      className="sticky top-0 z-50 bg-gradient-to-r from-primary/5 via-white to-primary/5 border-b-2 border-primary/20 shadow-lg animate-in fade-in-0 slide-in-from-top-4 duration-500"
    >
      {/* Animated Progress Bar */}
      <div className="h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 animate-pulse"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          {/* Status Icon and Info with Animation */}
          <div className="flex items-center space-x-3 animate-in fade-in-0 slide-in-from-left-4 duration-700">
            <div className={`p-2 rounded-lg ${statusConfig.color} shadow-md animate-bounce duration-1000`}>
              <StatusIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 animate-in fade-in-0 duration-500 delay-200">
                <p className="font-semibold text-sm text-gray-900">{statusConfig.text}</p>
                <Badge variant="outline" className="text-xs h-5 px-2 bg-primary/10 border-primary/30 text-primary font-medium animate-pulse">
                  {latestBooking.appointment.treatmentType}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 truncate leading-tight animate-in fade-in-0 duration-500 delay-300">
                {new Date(latestBooking.appointment.appointmentDate).toLocaleDateString()} at {latestBooking.appointment.appointmentTime}
              </p>
            </div>
          </div>

          {/* Practice Name with Animation */}
          <div className="hidden md:block text-xs text-gray-700 font-medium truncate max-w-xs animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-100">
            📍 {latestBooking.practice.name}
          </div>

          {/* Enhanced Action Button with Animation */}
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              console.log('BookingStatusHeader: Navigating to /booking-status');
              console.log('Current userId:', currentUserId);
              console.log('Latest booking:', latestBooking);
              setLocation('/booking-status');
            }}
            className="ml-3 shrink-0 text-xs h-8 px-4 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-right-4 delay-200 hover:scale-105"
          >
            <ExternalLink className="w-3 h-3 mr-1.5 animate-pulse" />
            <span className="hidden sm:inline font-medium">View Details</span>
            <span className="sm:hidden font-medium">Details</span>
          </Button>
        </div>
      </div>
      
      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50 animate-pulse pointer-events-none"></div>
    </div>
  );
}