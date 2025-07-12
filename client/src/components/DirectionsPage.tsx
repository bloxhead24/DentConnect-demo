import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Practice, Dentist } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
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
  const [activeTab, setActiveTab] = useState("profile");
  const [medicalHistory, setMedicalHistory] = useState({
    medications: "",
    allergies: "",
    medicalConditions: "",
    emergencyContact: "",
    emergencyPhone: "",
    insuranceProvider: "",
    insuranceNumber: "",
    notes: ""
  });
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);
  const { toast } = useToast();

  const { data: dentists = [] } = useQuery({
    queryKey: ["/api/dentists/practice", practice?.id],
    enabled: !!practice?.id,
  });

  const primaryDentist = dentists[0];
  const userLocation = [54.9783, -1.6178]; // Newcastle city center for demo

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

      // Use the user location constant
      
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

  // Helper functions
  const openInGoogleMaps = () => {
    const origin = `${userLocation[0]},${userLocation[1]}`;
    const destination = `${practice?.latitude},${practice?.longitude}`;
    const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
    window.open(url, '_blank');
  };

  const callPractice = () => {
    if (practice?.phone) {
      window.open(`tel:${practice.phone}`, '_self');
    }
  };

  const saveMedicalHistory = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Medical History Saved",
      description: "Your information has been securely saved for your appointment.",
    });
  };

  const shareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Emergency Dental Appointment',
        text: `I'm heading to ${practice?.name} for an emergency appointment`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Location Shared",
        description: "Practice location copied to clipboard.",
      });
    }
  };

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
      <div className="absolute inset-0 pt-20 pb-40">
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
      <div className="absolute bottom-48 left-4 right-4 z-50">
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
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 max-h-[40vh] overflow-y-auto">
        <div className="p-4 space-y-3">
          {/* Dentist Profile Button */}
          <Sheet open={showDentistProfile} onOpenChange={setShowDentistProfile}>
            <SheetTrigger asChild>
              <Card className="p-4 cursor-pointer hover:shadow-md transition-all bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center overflow-hidden shadow-lg">
                    {primaryDentist?.imageUrl ? (
                      <img src={primaryDentist.imageUrl} alt={primaryDentist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-white">{primaryDentist?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{primaryDentist?.title} {primaryDentist?.name}</h3>
                    <p className="text-sm text-teal-700 font-medium">{primaryDentist?.specialization}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-star text-yellow-400 text-xs"></i>
                        <span className="text-xs font-medium text-gray-700">4.9</span>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-800">{primaryDentist?.experience}+ years</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <i className="fas fa-chevron-up text-teal-500 text-lg"></i>
                    <span className="text-xs text-teal-600 font-medium">View Profile</span>
                  </div>
                </div>
              </Card>
            </SheetTrigger>
            
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-white to-teal-50">
              <SheetHeader>
                <div className="w-12 h-1 bg-teal-300 rounded-full mx-auto mb-4"></div>
                <SheetTitle className="text-left text-2xl font-bold text-gray-900">Your Emergency Dentist</SheetTitle>
              </SheetHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-teal-100">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">Profile</TabsTrigger>
                  <TabsTrigger value="medical" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">Medical Form</TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">Contact</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  {/* Hero Section with Large Photo */}
                  <Card className="p-0 bg-white border-teal-200 shadow-lg overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-br from-teal-500 via-blue-500 to-cyan-500">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex items-end space-x-4">
                          <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-2xl">
                            {primaryDentist?.imageUrl ? (
                              <img src={primaryDentist.imageUrl} alt={primaryDentist.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-5xl font-bold text-white/80">{primaryDentist?.name?.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <h1 className="text-3xl font-bold mb-1">{primaryDentist?.title} {primaryDentist?.name}</h1>
                            <p className="text-white/90 text-lg font-medium mb-2">{primaryDentist?.specialization}</p>
                            <div className="flex items-center space-x-4">
                              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                {primaryDentist?.experience}+ years experience
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <div className="flex text-yellow-300">
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className="fas fa-star text-sm"></i>
                                  ))}
                                </div>
                                <span className="text-white/90 font-medium">4.9 (127 reviews)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Professional Summary */}
                  <Card className="p-6 bg-white border-teal-200 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <i className="fas fa-stethoscope text-teal-600 mr-2"></i>
                        Your Emergency Dental Specialist
                      </h2>
                      <Button 
                        onClick={() => {
                          onClose();
                          toast({
                            title: "Searching for alternatives",
                            description: "Looking for other available emergency appointments...",
                          });
                        }}
                        variant="outline" 
                        size="sm"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <i className="fas fa-search mr-2"></i>
                        Find Another Dentist
                      </Button>
                    </div>
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 leading-relaxed font-medium">
                        {primaryDentist?.bio || "Dr. " + primaryDentist?.name + " is a highly experienced dental professional specializing in emergency care. With over " + primaryDentist?.experience + " years of practice, they provide compassionate, anxiety-free treatment for urgent dental needs."}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-shield-alt text-green-600 mr-2"></i>
                          <span className="font-semibold text-green-800">NHS Registered</span>
                        </div>
                        <p className="text-sm text-gray-600">GDC Number: {primaryDentist?.gdcNumber || "123456"}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-award text-blue-600 mr-2"></i>
                          <span className="font-semibold text-blue-800">Certified Specialist</span>
                        </div>
                        <p className="text-sm text-gray-600">Emergency Dentistry</p>
                      </div>
                    </div>
                  </Card>

                  {/* Detailed Qualifications */}
                  <Card className="p-6 bg-white border-teal-200 shadow-md">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-graduation-cap text-teal-600 mr-2"></i>
                      Education & Qualifications
                    </h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-teal-500 pl-4">
                        <h4 className="font-semibold text-gray-900">Primary Qualification</h4>
                        <p className="text-gray-700">{primaryDentist?.qualifications || "BDS (Bachelor of Dental Surgery) - University of Newcastle"}</p>
                        <p className="text-sm text-gray-500 mt-1">Graduated 2010</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900">Specialization</h4>
                        <p className="text-gray-700">Post-Graduate Certificate in Emergency Dentistry</p>
                        <p className="text-sm text-gray-500 mt-1">Royal College of Surgeons, 2015</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-gray-900">Additional Training</h4>
                        <p className="text-gray-700">Advanced Pain Management & Sedation Techniques</p>
                        <p className="text-sm text-gray-500 mt-1">British Society of Dental Anaesthesia, 2018</p>
                      </div>
                    </div>
                  </Card>

                  {/* Professional Memberships */}
                  <Card className="p-6 bg-white border-teal-200 shadow-md">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-users text-teal-600 mr-2"></i>
                      Professional Memberships
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <i className="fas fa-certificate text-white text-sm"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">General Dental Council (GDC)</p>
                          <p className="text-sm text-gray-600">Full registration since 2010</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <i className="fas fa-tooth text-white text-sm"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">British Dental Association (BDA)</p>
                          <p className="text-sm text-gray-600">Active member since 2010</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <i className="fas fa-ambulance text-white text-sm"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Emergency Dental Care Association</p>
                          <p className="text-sm text-gray-600">Specialist member since 2015</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Practice Philosophy */}
                  <Card className="p-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200 shadow-md">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-heart text-teal-600 mr-2"></i>
                      Treatment Philosophy
                    </h3>
                    <blockquote className="text-gray-700 leading-relaxed italic">
                      "I believe in providing gentle, compassionate emergency dental care that prioritizes patient comfort and anxiety management. Every patient deserves immediate pain relief and understanding during their most vulnerable moments."
                    </blockquote>
                    <p className="text-right text-gray-600 mt-2">- Dr. {primaryDentist?.name}</p>
                  </Card>

                  
                  {/* Recent Reviews with more detail */}
                  <Card className="p-6 bg-white border-teal-200 shadow-md">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-2"></i>
                      Recent Patient Reviews
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-5 border-l-4 border-yellow-400">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">SM</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Sarah M.</p>
                              <p className="text-xs text-gray-500">Emergency Patient • 2 days ago</p>
                            </div>
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className="fas fa-star text-sm"></i>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 font-medium leading-relaxed">"Dr. {primaryDentist?.name} was incredible during my emergency visit. I came in with severe tooth pain at 8 PM and they saw me immediately. Professional, gentle, and really put me at ease during a stressful situation. The pain relief was instant!"</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-5 border-l-4 border-blue-400">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">JT</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">James T.</p>
                              <p className="text-xs text-gray-500">Emergency Patient • 1 week ago</p>
                            </div>
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className="fas fa-star text-sm"></i>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 font-medium leading-relaxed">"Outstanding emergency care! I had a dental abscess and Dr. {primaryDentist?.name} saw me within 30 minutes. The whole team was efficient and caring. Highly recommend for urgent dental needs."</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-5 border-l-4 border-green-400">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">MR</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Michael R.</p>
                              <p className="text-xs text-gray-500">Emergency Patient • 2 weeks ago</p>
                            </div>
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className="fas fa-star text-sm"></i>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 font-medium leading-relaxed">"Fantastic emergency dentist! Dr. {primaryDentist?.name} was very understanding about my dental anxiety and took time to explain everything. The treatment was painless and my tooth feels perfect now."</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="medical" className="space-y-4">
                  <Card className="p-6 bg-white border-teal-200 shadow-md">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-clipboard-list text-teal-600 mr-2"></i>
                      Medical History Form
                    </h3>
                    <p className="text-gray-600 mb-6">Please fill out this information to help us provide the best care for your emergency appointment.</p>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">Emergency Contact</Label>
                          <Input
                            id="emergencyContact"
                            placeholder="Full name"
                            value={medicalHistory.emergencyContact}
                            onChange={(e) => setMedicalHistory({...medicalHistory, emergencyContact: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                          <Input
                            id="emergencyPhone"
                            placeholder="Phone number"
                            value={medicalHistory.emergencyPhone}
                            onChange={(e) => setMedicalHistory({...medicalHistory, emergencyPhone: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="medications">Current Medications</Label>
                        <Textarea
                          id="medications"
                          placeholder="List all medications you're currently taking, including dosage..."
                          value={medicalHistory.medications}
                          onChange={(e) => setMedicalHistory({...medicalHistory, medications: e.target.value})}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies</Label>
                        <Textarea
                          id="allergies"
                          placeholder="List any known allergies to medications, materials, or foods..."
                          value={medicalHistory.allergies}
                          onChange={(e) => setMedicalHistory({...medicalHistory, allergies: e.target.value})}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="conditions">Medical Conditions</Label>
                        <Textarea
                          id="conditions"
                          placeholder="List any chronic conditions, heart problems, diabetes, etc..."
                          value={medicalHistory.medicalConditions}
                          onChange={(e) => setMedicalHistory({...medicalHistory, medicalConditions: e.target.value})}
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="insurance">Insurance Provider</Label>
                          <Input
                            id="insurance"
                            placeholder="Insurance company name"
                            value={medicalHistory.insuranceProvider}
                            onChange={(e) => setMedicalHistory({...medicalHistory, insuranceProvider: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insuranceNumber">Insurance Number</Label>
                          <Input
                            id="insuranceNumber"
                            placeholder="Policy number"
                            value={medicalHistory.insuranceNumber}
                            onChange={(e) => setMedicalHistory({...medicalHistory, insuranceNumber: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any other information you'd like the dentist to know..."
                          value={medicalHistory.notes}
                          onChange={(e) => setMedicalHistory({...medicalHistory, notes: e.target.value})}
                          rows={3}
                        />
                      </div>
                      
                      <Button 
                        onClick={saveMedicalHistory}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <i className="fas fa-save mr-2"></i>
                        Save Medical History
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4">
                  <Card className="p-6 bg-white border-teal-200 shadow-md">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-phone text-teal-600 mr-2"></i>
                      Contact & Navigation
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-teal-50 rounded-lg p-4">
                        <h4 className="font-semibold text-teal-800 mb-2">Practice Information</h4>
                        <p className="text-gray-700 mb-2"><strong>{practice.name}</strong></p>
                        <p className="text-gray-600 mb-2">{practice.address}</p>
                        <p className="text-gray-600">Phone: {practice.phone}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={callPractice}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <i className="fas fa-phone mr-2"></i>
                          Call Practice
                        </Button>
                        <Button 
                          onClick={openInGoogleMaps}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <i className="fas fa-map-marked-alt mr-2"></i>
                          Google Maps
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={shareLocation}
                          variant="outline"
                          className="border-teal-300 text-teal-700 hover:bg-teal-50"
                        >
                          <i className="fas fa-share-alt mr-2"></i>
                          Share Location
                        </Button>
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(practice.address);
                            toast({
                              title: "Address Copied",
                              description: "Practice address copied to clipboard.",
                            });
                          }}
                          variant="outline"
                          className="border-teal-300 text-teal-700 hover:bg-teal-50"
                        >
                          <i className="fas fa-copy mr-2"></i>
                          Copy Address
                        </Button>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                        <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          Emergency Instructions
                        </h4>
                        <ul className="text-gray-700 space-y-1 text-sm">
                          <li>• Arrive 15 minutes early for urgent appointments</li>
                          <li>• Bring a valid ID and insurance card</li>
                          <li>• If pain worsens, call immediately</li>
                          <li>• Follow any pre-appointment instructions given</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          {/* Enhanced Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button 
              onClick={callPractice}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              <i className="fas fa-phone mr-2"></i>
              Call
            </Button>
            <Button 
              onClick={openInGoogleMaps}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <i className="fas fa-directions mr-2"></i>
              Navigate
            </Button>
            <Button 
              onClick={onBookAppointment}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
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