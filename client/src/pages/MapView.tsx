import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { TreatmentType, AccessibilityNeed } from "@/lib/types";
import { PracticePin } from "@/components/PracticePin";
import { PracticeBottomSheet } from "@/components/PracticeBottomSheet";
import { BookingFlow } from "@/components/BookingFlow";
import { SuccessModal } from "@/components/SuccessModal";
import { EnhancedMapSearch } from "@/components/EnhancedMapSearch";
import { SearchQuestionnaire, QuestionnaireData } from "@/components/SearchQuestionnaire";
import { MapLoadingState } from "@/components/MapLoadingState";
import { Button } from "@/components/ui/button";
import { Practice, Appointment } from "@shared/schema";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  selectedTreatment: TreatmentType | null;
  selectedAccessibility: AccessibilityNeed[];
  onBack: () => void;
}

export default function MapView({ selectedTreatment, selectedAccessibility, onBack }: MapViewProps) {
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPracticeSheet, setShowPracticeSheet] = useState(false);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [location, setLocation] = useState("Newcastle upon Tyne");
  const [searchFilters, setSearchFilters] = useState<{
    urgency?: string;
    anxietyLevel?: string;
    accessibilityNeeds?: string[];
  }>({});
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const { data: practices = [], isLoading } = useQuery({
    queryKey: ["/api/practices", { location }],
  });

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map centered on Newcastle upon Tyne
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [54.9783, -1.6178], // Newcastle upon Tyne coordinates
        zoom: 11,
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
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when practices change
  useEffect(() => {
    if (mapInstanceRef.current && practices.length > 0) {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      markersRef.current = [];

      // Northeast England practice coordinates
      const practiceCoordinates = [
        [54.9783, -1.6178], // Newcastle upon Tyne
        [54.9533, -1.6103], // Gateshead
        [54.7767, -1.5711], // Durham
        [55.0167, -1.4436], // North Shields
        [54.8544, -1.8320], // Consett
        [54.9742, -2.1267], // Hexham
        [54.5253, -1.5581], // Darlington
        [54.9200, -1.5800], // Chester-le-Street
      ];

      // Create custom marker icon
      const customIcon = L.divIcon({
        html: `<div class="custom-marker">
          <div class="marker-pin">
            <i class="fas fa-tooth text-white"></i>
          </div>
          <div class="marker-shadow"></div>
        </div>`,
        className: 'custom-marker-container',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
      });

      // Add markers for each practice
      practices.forEach((practice: Practice, index) => {
        const coords = practiceCoordinates[index] || [54.9783, -1.6178];
        
        const marker = L.marker(coords as [number, number], { 
          icon: customIcon 
        }).addTo(mapInstanceRef.current!);
        
        marker.on('click', () => {
          handlePracticeClick(practice);
        });
        
        markersRef.current.push(marker);
      });
    }
  }, [practices]);

  const handlePracticeClick = (practice: Practice) => {
    setSelectedPractice(practice);
    setShowPracticeSheet(true);
  };

  const handleBookAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPracticeSheet(false);
    setShowBookingFlow(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingFlow(false);
    setShowSuccess(true);
  };

  const handleQuestionnaireComplete = (data: QuestionnaireData) => {
    setQuestionnaireData(data);
    setSearchFilters({
      urgency: data.urgency,
      anxietyLevel: data.anxietyLevel,
      accessibilityNeeds: selectedAccessibility.map(need => need.name),
    });
    setShowQuestionnaire(false);
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
  };

  const handleFilterToggle = () => {
    // Future filter panel implementation
    console.log("Filter panel toggle");
  };



  return (
    <div className="onboarding-step active">
      {/* Enhanced Search Bar */}
      <EnhancedMapSearch
        onLocationChange={handleLocationChange}
        onFilterToggle={handleFilterToggle}
        onQuestionnaireOpen={() => setShowQuestionnaire(true)}
        searchFilters={searchFilters}
      />

      {/* Map Container with Leaflet */}
      <div className="map-container h-screen relative overflow-hidden">
        <div 
          ref={mapRef} 
          className="absolute inset-0 w-full h-full z-10"
          style={{ background: '#f8f9fa' }}
        />
        
        {/* Enhanced Loading State */}
        <MapLoadingState isLoading={isLoading} searchQuery={location} />
      </div>

      {/* Filter Button */}
      <div className="absolute bottom-32 right-4 z-40">
        <Button
          size="icon"
          className="floating-button w-14 h-14 bg-white hover:bg-primary/10 rounded-full shadow-floating"
          variant="outline"
        >
          <i className="fas fa-filter text-primary"></i>
        </Button>
      </div>

      {/* List View Toggle */}
      <div className="absolute bottom-32 left-4 z-40">
        <Button
          size="icon"
          className="floating-button w-14 h-14 bg-white hover:bg-primary/10 rounded-full shadow-floating"
          variant="outline"
        >
          <i className="fas fa-list text-primary"></i>
        </Button>
      </div>

      {/* Back Button */}
      <div className="absolute top-20 left-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-white hover:bg-primary/10"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </Button>
      </div>

      {/* Practice Bottom Sheet */}
      <PracticeBottomSheet
        practice={selectedPractice}
        isOpen={showPracticeSheet}
        onClose={() => setShowPracticeSheet(false)}
        onBookAppointment={handleBookAppointment}
      />

      {/* Booking Flow */}
      <BookingFlow
        practice={selectedPractice}
        selectedAppointment={selectedAppointment}
        isOpen={showBookingFlow}
        onClose={() => setShowBookingFlow(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Search Questionnaire */}
      <SearchQuestionnaire
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        onComplete={handleQuestionnaireComplete}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
