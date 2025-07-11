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
import { UrgentSearchLoading } from "@/components/UrgentSearchLoading";
import { DirectionsPage } from "@/components/DirectionsPage";
import { Button } from "@/components/ui/button";
import { Practice, Appointment } from "@shared/schema";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PracticePinModal } from "@/components/PracticePinModal";

interface MapViewProps {
  selectedTreatment: TreatmentType | null;
  selectedAccessibility: AccessibilityNeed[];
  selectedSearchMode?: "open" | "practice" | "mydentist";
  onBack: () => void;
}

export default function MapView({ selectedTreatment, selectedAccessibility, selectedSearchMode = "open", onBack }: MapViewProps) {
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

  const [showUrgentLoading, setShowUrgentLoading] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [urgentPractice, setUrgentPractice] = useState<Practice | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinPractice, setPinPractice] = useState<Practice | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(selectedSearchMode === "open");
  
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
        zoom: window.innerWidth < 768 ? 10 : 11, // Adjust zoom for mobile
        zoomControl: false,
        attributionControl: false,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: true,
        dragging: true,
        tap: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add custom zoom control - position based on screen size
      const zoomPosition = window.innerWidth < 768 ? 'bottomright' : 'bottomright';
      L.control.zoom({ position: zoomPosition }).addTo(mapInstanceRef.current);
      
      // Force map to invalidate size after initialization
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current?.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
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

      // Northeast England practice coordinates - expanded coverage
      const practiceCoordinates = [
        [54.9783, -1.6178], // Newcastle upon Tyne
        [54.9533, -1.6103], // Gateshead
        [54.7767, -1.5711], // Durham
        [55.0167, -1.4436], // North Shields
        [54.8544, -1.8320], // Consett
        [54.9742, -2.1267], // Hexham
        [54.5253, -1.5581], // Darlington
        [54.9200, -1.5800], // Chester-le-Street
        [54.9069, -1.3838], // Sunderland
        [54.5742, -1.2349], // Middlesbrough
        [54.6869, -1.2155], // Hartlepool
        [54.5707, -1.3182], // Stockton-on-Tees
        [55.7707, -2.0107], // Berwick-upon-Tweed
        [55.0424, -1.4481], // Whitley Bay
        [55.0178, -1.4217], // Tynemouth
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
    // For authenticated search modes, go directly to practice sheet
    setShowPracticeSheet(true);
  };

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
    setShowPinModal(false);
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

  const handleUrgentSearch = () => {
    setShowUrgentLoading(true);
    // Simulate AI-powered urgent search with realistic delay
    setTimeout(() => {
      setShowUrgentLoading(false);
      // Find first available emergency appointment
      const foundPractice = practices.find(p => p.availableAppointments?.length > 0);
      if (foundPractice) {
        setUrgentPractice(foundPractice);
        setShowDirections(true);
      }
    }, 4000); // 4 second loading animation
  };

  const handleDirectionsClose = () => {
    setShowDirections(false);
    setUrgentPractice(null);
  };

  const handleArrivedAtPractice = () => {
    setShowDirections(false);
    if (urgentPractice) {
      setSelectedPractice(urgentPractice);
      setShowBookingFlow(true);
    }
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
      {/* Enhanced Search Bar - Mobile Optimized */}
      <div className="absolute top-16 left-4 right-4 z-50 md:relative md:top-0 md:left-0 md:right-0 md:z-auto">
        <EnhancedMapSearch
          onLocationChange={handleLocationChange}
          onFilterToggle={handleFilterToggle}
          onQuestionnaireOpen={() => setShowQuestionnaire(true)}
          searchMode={selectedSearchMode}
          searchFilters={searchFilters}
        />
      </div>

      {/* Map Container with Leaflet - Mobile Optimized */}
      <div className="h-screen w-full relative overflow-hidden">
        <div 
          ref={mapRef} 
          className="absolute inset-0 w-full h-full z-10"
          style={{ background: '#f8f9fa' }}
        />
        
        {/* Enhanced Loading State */}
        <MapLoadingState isLoading={isLoading} searchQuery={location} />
        
        {/* Mobile Back Button */}
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="touch-target bg-white hover:bg-primary/10 shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </div>
        
        {/* Urgent Search Floating Button - Mobile Optimized */}
        <div className="absolute bottom-20 right-4 z-50">
          <Button
            onClick={handleUrgentSearch}
            className="touch-target w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center animate-pulse"
            size="icon"
          >
            <div className="text-center">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="text-xs font-bold">URGENT</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Filter Button - Mobile Optimized */}
      <div className="absolute bottom-32 right-4 z-40">
        <Button
          size="icon"
          className="touch-target w-14 h-14 bg-white hover:bg-primary/10 rounded-full shadow-lg"
          variant="outline"
          onClick={() => setShowQuestionnaire(true)}
        >
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </Button>
      </div>

      {/* List View Toggle - Mobile Optimized */}
      <div className="absolute bottom-32 left-4 z-40">
        <Button
          size="icon"
          className="touch-target w-14 h-14 bg-white hover:bg-primary/10 rounded-full shadow-lg"
          variant="outline"
        >
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </Button>
      </div>

      {/* Practice PIN Authentication Modal */}
      <PracticePinModal
        practice={pinPractice}
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPinPractice(null);
        }}
        onSuccess={handlePinSuccess}
        searchMode={selectedSearchMode === "practice" || selectedSearchMode === "mydentist" ? selectedSearchMode : "practice"}
      />

      {/* Practice Bottom Sheet */}
      <PracticeBottomSheet
        practice={selectedPractice}
        isOpen={showPracticeSheet}
        onClose={() => setShowPracticeSheet(false)}
        onBookAppointment={handleBookAppointment}
        searchMode={selectedSearchMode}
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

      {/* Urgent Search Loading */}
      <UrgentSearchLoading
        isVisible={showUrgentLoading}
        onComplete={() => setShowUrgentLoading(false)}
      />

      {/* Directions Page */}
      <DirectionsPage
        practice={urgentPractice}
        isOpen={showDirections}
        onClose={handleDirectionsClose}
        onBookAppointment={handleArrivedAtPractice}
      />
    </div>
  );
}
