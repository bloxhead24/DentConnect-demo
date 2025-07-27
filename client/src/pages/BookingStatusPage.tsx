import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, Activity, Heart, FileText, AlertTriangle, CheckCircle2, XCircle, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import L from 'leaflet';

interface BookingStatus {
  id: number;
  status: string;
  approvalStatus: string;
  appointment: {
    appointmentDate: string;
    appointmentTime: string;
    treatmentType: string;
    duration: number;
  };
  practice: {
    name: string;
    address: string;
    phone: string;
    latitude?: number;
    longitude?: number;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  treatmentCategory: string;
  specialRequests?: string;
  createdAt: string;
  approvedAt?: string;
}

// Simple Map Component
function PracticeMap({ practice }: { practice: { name: string; address: string; latitude?: number; longitude?: number } }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !practice.latitude || !practice.longitude) return;

    // Clear existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map
    const map = L.map(mapRef.current).setView([practice.latitude, practice.longitude], 15);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create custom marker icon
    const markerIcon = L.divIcon({
      html: `
        <div style="
          background: #059669;
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            color: white;
            font-size: 14px;
            transform: rotate(45deg);
            font-weight: bold;
          ">🦷</div>
        </div>
      `,
      className: 'custom-dental-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    // Add marker
    L.marker([practice.latitude, practice.longitude], { icon: markerIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong>${practice.name}</strong><br>
          <small>${practice.address}</small>
        </div>
      `);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [practice.latitude, practice.longitude, practice.name, practice.address]);

  if (!practice.latitude || !practice.longitude) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>Map location not available</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-64 w-full rounded-lg border-2 border-gray-200" />;
}

export default function BookingStatusPage() {
  const [, setLocation] = useLocation();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('currentUserId');
    if (userId) {
      setCurrentUserId(parseInt(userId));
    }
  }, []);

  const { data: bookings = [], isLoading } = useQuery<BookingStatus[]>({
    queryKey: ['/api/users', currentUserId, 'bookings'],
    queryFn: async () => {
      if (!currentUserId) return [];
      const response = await fetch(`/api/users/${currentUserId}/bookings`);
      if (!response.ok) throw new Error('Failed to fetch user bookings');
      return response.json();
    },
    enabled: !!currentUserId,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Get the most recent booking
  const latestBooking = bookings.length > 0 ? bookings[bookings.length - 1] : null;

  const getStatusIcon = (approvalStatus: string) => {
    switch (approvalStatus) {
      case 'approved':
        return <CheckCircle2 className="h-8 w-8 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Clock className="h-8 w-8 text-amber-600 animate-pulse" />;
    }
  };

  const getStatusConfig = (approvalStatus: string) => {
    switch (approvalStatus) {
      case 'approved':
        return {
          title: 'Appointment Confirmed!',
          description: 'Your appointment has been approved by the dentist',
          color: 'bg-green-50 border-green-200',
          headerColor: 'bg-green-500',
          textColor: 'text-green-800'
        };
      case 'rejected':
        return {
          title: 'Appointment Not Available',
          description: 'Sorry, this appointment slot is no longer available',
          color: 'bg-red-50 border-red-200',
          headerColor: 'bg-red-500',
          textColor: 'text-red-800'
        };
      default:
        return {
          title: 'Reviewing Your Request',
          description: 'Your booking is being reviewed by the dental practice',
          color: 'bg-amber-50 border-amber-200',
          headerColor: 'bg-amber-500',
          textColor: 'text-amber-800'
        };
    }
  };

  const getUrgencyColor = (category: string) => {
    switch (category) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'routine':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cosmetic':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking status...</p>
        </div>
      </div>
    );
  }

  if (!latestBooking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Activity className="h-6 w-6 text-gray-400" />
              <span>No Bookings Found</span>
            </CardTitle>
            <CardDescription>
              You don't have any appointment bookings yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(latestBooking.approvalStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Status</h1>
              <p className="text-sm text-gray-600">Track your appointment request</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Status Overview */}
        <Card className={`border-2 ${statusConfig.color}`}>
          <div className={`h-2 w-full ${statusConfig.headerColor}`}></div>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getStatusIcon(latestBooking.approvalStatus)}
            </div>
            <CardTitle className={`text-2xl ${statusConfig.textColor}`}>
              {statusConfig.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {statusConfig.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Appointment Date</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {format(new Date(latestBooking.appointment.appointmentDate), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Time & Duration</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {latestBooking.appointment.appointmentTime} ({latestBooking.appointment.duration} mins)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practice Location & Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Practice Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Interactive Map */}
            <div className="space-y-3">
              <PracticeMap practice={latestBooking.practice} />
              
              {/* Address and Navigation */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{latestBooking.practice.name}</h4>
                    <p className="text-gray-600 text-sm">{latestBooking.practice.address}</p>
                  </div>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {latestBooking.practice.latitude && latestBooking.practice.longitude && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latestBooking.practice.latitude},${latestBooking.practice.longitude}`;
                          window.open(googleMapsUrl, '_blank');
                        }}
                        className="flex-1 flex items-center space-x-2"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Get Directions</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const appleMapsUrl = `http://maps.apple.com/?daddr=${latestBooking.practice.latitude},${latestBooking.practice.longitude}`;
                          window.open(appleMapsUrl, '_blank');
                        }}
                        className="flex-1 flex items-center space-x-2"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Apple Maps</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(latestBooking.practice.address);
                      // Could add a toast notification here if needed
                    }}
                    className="flex-1 flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Copy Address</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Appointment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Treatment Type</h4>
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor(latestBooking.treatmentCategory)}>
                      {latestBooking.treatmentCategory.charAt(0).toUpperCase() + latestBooking.treatmentCategory.slice(1)}
                    </Badge>
                    <span className="text-gray-600">{latestBooking.appointment.treatmentType}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Practice</h4>
                  <div className="space-y-1">
                    <p className="font-medium">{latestBooking.practice.name}</p>
                    <p className="text-sm text-gray-600">{latestBooking.practice.address}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{latestBooking.practice.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{latestBooking.user?.firstName || "Patient"} {latestBooking.user?.lastName || "Name"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{latestBooking.user?.email || "No email provided"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{latestBooking.user?.phone || "No phone provided"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Booking Timeline</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Submitted: {format(new Date(latestBooking.createdAt), 'MMM d, yyyy • h:mm a')}</p>
                    {latestBooking.approvedAt && (
                      <p>Approved: {format(new Date(latestBooking.approvedAt), 'MMM d, yyyy • h:mm a')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {latestBooking.specialRequests && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {latestBooking.specialRequests}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        {latestBooking.approvalStatus === 'approved' && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800 flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Next Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="text-sm text-gray-700">
                  <div className="flex items-center space-x-2 font-medium mb-2">
                    <Activity className="h-4 w-4 text-green-600" />
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

        {latestBooking.approvalStatus === 'rejected' && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg text-red-800 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Alternative Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-700">
                  Don't worry! We can help you find another suitable appointment.
                </p>
                <Button onClick={() => setLocation('/')} className="w-full">
                  Find Another Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}