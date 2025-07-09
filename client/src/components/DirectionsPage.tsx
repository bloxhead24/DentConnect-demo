import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Practice, Dentist } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DirectionsPageProps {
  practice: Practice | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: () => void;
}

export function DirectionsPage({ practice, isOpen, onClose, onBookAppointment }: DirectionsPageProps) {
  const [showDentistProfile, setShowDentistProfile] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);

  const { data: dentists = [] } = useQuery({
    queryKey: ["/api/dentists/practice", practice?.id],
    enabled: !!practice?.id,
  });

  const primaryDentist = dentists[0];

  // Initialize directions map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && practice && isOpen) {
      // Create map centered on practice location
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [practice.latitude, practice.longitude],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add custom zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

      // Create destination marker
      const destinationIcon = L.divIcon({
        html: `<div class="destination-marker">
          <div class="marker-pin urgent">
            <i class="fas fa-map-marker-alt text-white"></i>
          </div>
          <div class="marker-shadow"></div>
        </div>`,
        className: 'destination-marker-container',
        iconSize: [40, 50],
        iconAnchor: [20, 50],
      });

      // Add destination marker
      L.marker([practice.latitude, practice.longitude], { 
        icon: destinationIcon 
      }).addTo(mapInstanceRef.current);

      // Simulate user location (Newcastle city center for demo)
      const userLocation = [54.9783, -1.6178];
      
      // Create user location marker
      const userIcon = L.divIcon({
        html: `<div class="user-marker">
          <div class="pulse-ring"></div>
          <div class="user-dot"></div>
        </div>`,
        className: 'user-marker-container',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker(userLocation, { icon: userIcon }).addTo(mapInstanceRef.current);

      // Create route line (simplified for demo)
      const routeLine = L.polyline([
        userLocation,
        [practice.latitude, practice.longitude]
      ], {
        color: '#ef4444',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(mapInstanceRef.current);

      // Fit map to show both markers
      const group = new L.FeatureGroup([
        L.marker(userLocation),
        L.marker([practice.latitude, practice.longitude])
      ]);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [practice, isOpen]);

  if (!practice || !isOpen) return null;

  const estimatedTime = "8 min";
  const distance = "2.1 miles";

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center space-x-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back</span>
          </Button>
          <div className="text-center">
            <h1 className="font-semibold text-gray-900">Directions</h1>
            <p className="text-sm text-gray-600">{estimatedTime} • {distance}</p>
          </div>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0 pt-20 pb-32">
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ background: '#f8f9fa' }}
        />
      </div>

      {/* Urgent Banner */}
      <div className="absolute top-20 left-4 right-4 z-50">
        <Card className="bg-red-600 border-red-600 text-white p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-bolt text-white"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">URGENT APPOINTMENT CONFIRMED</h3>
              <p className="text-sm text-red-100">Dr. {primaryDentist?.name} is waiting for you</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Instructions */}
      <div className="absolute bottom-40 left-4 right-4 z-50">
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-location-arrow text-white"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Head northeast on Grey Street</h3>
                <p className="text-sm text-gray-600">Continue for 0.8 miles</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{estimatedTime}</p>
                <p className="text-xs text-gray-500">{distance}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="p-4 space-y-3">
          {/* Dentist Profile Button */}
          <Sheet open={showDentistProfile} onOpenChange={setShowDentistProfile}>
            <SheetTrigger asChild>
              <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {primaryDentist?.imageUrl ? (
                      <img src={primaryDentist.imageUrl} alt={primaryDentist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-gray-600">{primaryDentist?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{primaryDentist?.title} {primaryDentist?.name}</h3>
                    <p className="text-sm text-gray-600">{primaryDentist?.specialization}</p>
                  </div>
                  <i className="fas fa-chevron-up text-gray-400"></i>
                </div>
              </Card>
            </SheetTrigger>
            
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <SheetTitle className="text-left">Your Emergency Dentist</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6">
                {/* Dentist Profile */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {primaryDentist?.imageUrl ? (
                      <img src={primaryDentist.imageUrl} alt={primaryDentist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-semibold text-gray-600">{primaryDentist?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{primaryDentist?.title} {primaryDentist?.name}</h2>
                    <p className="text-gray-600 mb-2">{primaryDentist?.specialization}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{primaryDentist?.experience} years experience</Badge>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-star text-yellow-400"></i>
                        <span className="text-sm font-medium">4.9</span>
                        <span className="text-sm text-gray-500">(127 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600 leading-relaxed">{primaryDentist?.bio}</p>
                </div>

                {/* Qualifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Qualifications</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{primaryDentist?.qualifications}</p>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {primaryDentist?.languages && JSON.parse(primaryDentist.languages).map((lang: string) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Reviews</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex text-yellow-400">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </div>
                        <span className="text-sm text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-sm text-gray-700">"Excellent emergency care! Dr. {primaryDentist?.name} was very gentle and professional during my urgent visit."</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex text-yellow-400">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </div>
                        <span className="text-sm text-gray-500">1 week ago</span>
                      </div>
                      <p className="text-sm text-gray-700">"Great experience! The practice was very accommodating for my emergency appointment."</p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(`tel:${practice.phone}`, '_self')}
            >
              <i className="fas fa-phone mr-2"></i>
              Call Practice
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={onBookAppointment}
            >
              <i className="fas fa-calendar-check mr-2"></i>
              I'm Here
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}