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
      className="relative bg-gradient-to-r from-primary/5 via-white to-primary/5 border-b border-primary/10 shadow-sm animate-in fade-in-0 slide-in-from-top-4 duration-500"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-2">
          {/* Status Icon and Info */}
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-lg ${statusConfig.color} shadow-sm`}>
              <StatusIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm text-gray-900">{statusConfig.text}</p>
                <Badge variant="outline" className="text-xs h-5 px-2 bg-primary/5 border-primary/20 text-primary">
                  {latestBooking.appointment.treatmentType}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {new Date(latestBooking.appointment.appointmentDate).toLocaleDateString()} at {latestBooking.appointment.appointmentTime}
              </p>
            </div>
          </div>

          {/* Practice Name */}
          <div className="hidden md:block text-xs text-gray-600 truncate max-w-xs">
            📍 {latestBooking.practice.name}
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/booking-status')}
            className="text-xs h-7 px-3 border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3 mr-1.5" />
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">Details</span>
          </Button>
        </div>
      </div>
    </div>
  );
}