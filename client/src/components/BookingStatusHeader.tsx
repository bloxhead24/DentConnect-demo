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
}

export function BookingStatusHeader() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const [animationKey, setAnimationKey] = useState(0);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check for currentUserId in sessionStorage
    const userId = sessionStorage.getItem('currentUserId');
    if (userId) {
      setCurrentUserId(parseInt(userId));
    }
    // Also check if there's a logged in user
    const userStr = sessionStorage.getItem('dentconnect_user');
    if (userStr && !userId) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          setCurrentUserId(user.id);
          sessionStorage.setItem('currentUserId', user.id.toString());
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
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

  // Trigger animation when status changes
  useEffect(() => {
    if (latestBooking && latestBooking.approvalStatus) {
      const currentStatus = latestBooking.approvalStatus;
      if (lastStatus && lastStatus !== currentStatus) {
        setAnimationKey(prev => prev + 1);
      }
      setLastStatus(currentStatus);
    }
  }, [latestBooking?.approvalStatus, lastStatus]);

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
    <div className="fixed top-4 right-4 z-50 group">
      {/* Floating Indicator - Always visible */}
      <div 
        key={animationKey}
        className={`${statusConfig.color} rounded-full p-3 shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 animate-in fade-in-0 slide-in-from-right-4`}
      >
        <StatusIcon className="w-5 h-5" />
      </div>
      
      {/* Detailed Card - Shows on hover */}
      <div className="absolute top-0 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <Card className="w-80 shadow-xl border-primary/20 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Status Header */}
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${statusConfig.color} shadow-sm`}>
                <StatusIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{statusConfig.text}</p>
                <p className="text-xs text-gray-500">{statusConfig.description}</p>
              </div>
            </div>
            
            {/* Appointment Details */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-600">
                  {new Date(latestBooking.appointment.appointmentDate).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })} at {latestBooking.appointment.appointmentTime}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-600">
                  Your Appointment
                </span>
              </div>
              
              <div className="text-xs text-gray-600">
                📍 {latestBooking.practice.name}
              </div>
            </div>
            
            {/* Action Button */}
            <Button 
              size="sm" 
              className="w-full mt-3"
              onClick={() => setLocation('/booking-status')}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}