import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { cn } from "../lib/utils";
import { DiaryView } from "../components/DiaryView";
import { CallbackRequestModal } from "../components/CallbackRequestModal";
import { AppointmentStatusTracker } from "../components/AppointmentStatusTracker";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PhoneCall, Star, MapPin, Clock, Users, Award, Shield, Accessibility } from "lucide-react";
import type { Practice, Dentist, Appointment } from "@shared/schema";

interface AuthenticatedDiaryProps {
  onBack: () => void;
  onBookAppointment: (appointment: Appointment) => void;
  currentUserId?: number;
}

export default function AuthenticatedDiary({ onBack, onBookAppointment, currentUserId }: AuthenticatedDiaryProps) {
  const [showFullDiary, setShowFullDiary] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [showStatusTracker, setShowStatusTracker] = useState(false);
  
  const practiceTag = sessionStorage.getItem('authenticatedPracticeTag');
  const searchMode = sessionStorage.getItem('searchMode') as "practice" | "mydentist";
  const userId = currentUserId || parseInt(sessionStorage.getItem('currentUserId') || '0');

  // Query for practice by connection tag (includes appointments and dentists)
  const { data: practiceData } = useQuery<Practice & { availableAppointments: Appointment[], dentists: Dentist[] }>({
    queryKey: ["/api/practices/tag", practiceTag],
    enabled: !!practiceTag,
    queryFn: async () => {
      const response = await fetch(`/api/practices/tag/${practiceTag}`);
      if (!response.ok) throw new Error('Practice not found');
      return response.json();
    }
  });

  useEffect(() => {
    if (practiceData) {
      setSelectedPractice(practiceData);
      
      // For mydentist mode, select the first dentist at the practice
      if (searchMode === "mydentist" && practiceData.dentists?.length > 0) {
        setSelectedDentist(practiceData.dentists[0]);
      }
    }
  }, [practiceData, searchMode]);

  const getQuickestAppointment = () => {
    if (!practiceData?.availableAppointments?.length) return null;
    
    // Return earliest available appointment based on search mode
    if (searchMode === "mydentist" && selectedDentist) {
      // For mydentist mode, return earliest appointment with the specific dentist
      const dentistAppointments = practiceData.availableAppointments.filter(
        apt => apt.dentistId === selectedDentist.id
      );
      return dentistAppointments.length > 0 ? dentistAppointments[0] : null;
    } else {
      // For practice mode, return earliest appointment with any dentist at the practice
      return practiceData.availableAppointments[0];
    }
  };

  const quickestAppointment = getQuickestAppointment();

  const getBudgetSymbols = (treatmentType: string) => {
    // Show budget symbols based on treatment type
    if (treatmentType === "emergency") return "£££";
    if (treatmentType === "cosmetic") return "££££";
    if (treatmentType === "routine") return "££";
    return "£";
  };

  // Mock data for enhanced practice details
  const practiceServices = [
    { category: "Emergency Care", treatments: [
      { name: "Emergency Dental Care", price: "£120-£250", duration: "30-60 min", description: "Immediate relief for dental pain and trauma" },
      { name: "Emergency Tooth Extraction", price: "£150-£300", duration: "45-90 min", description: "Same-day extraction for damaged teeth" },
      { name: "Temporary Filling", price: "£80-£120", duration: "30 min", description: "Immediate pain relief and tooth protection" }
    ]},
    { category: "General Dentistry", treatments: [
      { name: "Comprehensive Examination", price: "£65", duration: "30 min", description: "Full oral health assessment with X-rays" },
      { name: "Hygienist Clean", price: "£75", duration: "30 min", description: "Professional teeth cleaning and oral health advice" },
      { name: "White Fillings", price: "£95-£150", duration: "30-45 min", description: "Tooth-colored composite fillings" },
      { name: "Root Canal Treatment", price: "£450-£750", duration: "90-120 min", description: "Save infected teeth with specialist care" }
    ]},
    { category: "Cosmetic Dentistry", treatments: [
      { name: "Teeth Whitening", price: "£350", duration: "60 min", description: "Professional whitening for brighter smile" },
      { name: "Porcelain Veneers", price: "£850-£1200", duration: "2 visits", description: "Transform your smile with custom veneers" },
      { name: "Composite Bonding", price: "£250-£400", duration: "60 min", description: "Repair and reshape teeth naturally" }
    ]}
  ];

  const practiceReviews = [
    { name: "Sarah Mitchell", rating: 5, date: "2 weeks ago", comment: "Exceptional care! Dr. Thompson was incredibly gentle and professional. The whole team made me feel at ease during my emergency visit.", verified: true },
    { name: "James Wilson", rating: 5, date: "1 month ago", comment: "Outstanding practice. Modern facilities, friendly staff, and Dr. Thompson's expertise in cosmetic dentistry gave me the confidence to smile again!", verified: true },
    { name: "Emma Thompson", rating: 5, date: "6 weeks ago", comment: "Brilliant with children! My daughter was nervous but the team were amazing. Highly recommend for families.", verified: true },
    { name: "Michael Chen", rating: 4, date: "2 months ago", comment: "Professional service and excellent results. The only minor issue was the waiting time, but the quality of care made up for it.", verified: true }
  ];

  const practiceFeatures = [
    { icon: "fas fa-shield-alt", title: "CQC Outstanding Rating", description: "Highest quality and safety standards" },
    { icon: "fas fa-award", title: "Royal College Recognition", description: "Excellence in dental innovation 2025" },
    { icon: "fas fa-clock", title: "Same-Day Appointments", description: "Emergency slots available daily" },
    { icon: "fas fa-heart", title: "Anxiety-Free Dentistry", description: "Sedation and comfort options available" },
    { icon: "fas fa-universal-access", title: "Full Accessibility", description: "Wheelchair access and support services" },
    { icon: "fas fa-leaf", title: "Eco-Friendly Practice", description: "Carbon neutral and sustainable dentistry" }
  ];

  if (!selectedPractice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-lg text-gray-600">Connecting to your {searchMode === "mydentist" ? "dentist" : "practice"}...</p>
        </div>
      </div>
    );
  }

  if (showFullDiary) {
    return (
      <DiaryView
        practice={selectedPractice}
        dentist={selectedDentist}
        searchMode={searchMode}
        isOpen={true}
        onClose={() => setShowFullDiary(false)}
        onBookAppointment={onBookAppointment}
      />
    );
  }

  if (showStatusTracker && selectedPractice && userId) {
    return (
      <AppointmentStatusTracker
        userId={userId}
        practice={selectedPractice}
        onBack={() => setShowStatusTracker(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center px-3 py-2">
            <i className="fas fa-arrow-left mr-2"></i>
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="text-center flex-1 px-2">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight">
              {searchMode === "mydentist" ? "My Dentist" : "My Practice"}
            </h1>
          </div>
          <div className="w-12 sm:w-16"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Practice Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-teal-600 text-white">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative px-4 sm:px-6 py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
              {/* Practice Info */}
              <div className="lg:col-span-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                    <i className="fas fa-check mr-1 sm:mr-2"></i>
                    <span className="truncate">Connected to {practiceTag}</span>
                  </Badge>
                  <Badge className="bg-green-500/80 text-white text-xs px-2 py-1">
                    <Award className="w-3 h-3 mr-1" />
                    CQC
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">{selectedPractice.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-white/90 text-sm sm:text-base">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{selectedPractice.rating}</span>
                    <span className="hidden sm:inline">({selectedPractice.reviewCount} reviews)</span>
                    <span className="sm:hidden">({selectedPractice.reviewCount})</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{selectedPractice.address}</span>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-start space-x-2 text-sm sm:text-base">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{selectedPractice.openingHours}</span>
                </div>
              </div>

              {/* Quick Action Panel */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Quick Actions</h3>
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    onClick={() => quickestAppointment && onBookAppointment(quickestAppointment)}
                    disabled={!quickestAppointment}
                    className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold text-sm sm:text-base"
                    size="lg"
                  >
                    <i className="fas fa-bolt mr-2"></i>
                    <span className="hidden sm:inline">Book Next Available</span>
                    <span className="sm:hidden">Book Next</span>
                  </Button>
                  <Button
                    onClick={() => setShowFullDiary(true)}
                    className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white hover:text-blue-600 font-semibold shadow-lg text-sm sm:text-base"
                    size="lg"
                  >
                    <i className="fas fa-calendar-alt mr-2"></i>
                    <span className="hidden sm:inline">View Full Diary</span>
                    <span className="sm:hidden">Full Diary</span>
                  </Button>
                  <CallbackRequestModal practiceId={selectedPractice.id} practiceName={selectedPractice.name}>
                    <Button
                      className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white hover:text-blue-600 font-semibold shadow-lg"
                    >
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Get Cancellation Alerts
                    </Button>
                  </CallbackRequestModal>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 sm:mb-8 h-16 sm:h-auto bg-gray-100 rounded-lg p-1">
              <TabsTrigger value="appointments" className="flex flex-col items-center justify-center px-1 py-2 text-xs font-medium min-h-[3rem] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <Clock className="w-4 h-4 mb-1" />
                <span className="leading-tight text-center">Appts</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex flex-col items-center justify-center px-1 py-2 text-xs font-medium min-h-[3rem] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <Users className="w-4 h-4 mb-1" />
                <span className="leading-tight text-center">Team</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex flex-col items-center justify-center px-1 py-2 text-xs font-medium min-h-[3rem] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <i className="fas fa-tooth text-sm mb-1"></i>
                <span className="leading-tight text-center">Services</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex flex-col items-center justify-center px-1 py-2 text-xs font-medium min-h-[3rem] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <Star className="w-4 h-4 mb-1" />
                <span className="leading-tight text-center">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex flex-col items-center justify-center px-1 py-2 text-xs font-medium min-h-[3rem] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <Shield className="w-4 h-4 mb-1" />
                <span className="leading-tight text-center">About</span>
              </TabsTrigger>
            </TabsList>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Next Available Appointment */}
                <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-bolt text-white text-base sm:text-xl"></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold leading-tight">Next Available</h3>
                        <p className="text-xs sm:text-sm font-normal text-gray-600 truncate">
                          {searchMode === "mydentist" && selectedDentist
                            ? `With ${selectedDentist.name}` 
                            : "Any available dentist"
                          }
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quickestAppointment ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {format(new Date(quickestAppointment.appointmentDate), 'MMM d, yyyy')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {quickestAppointment.appointmentTime} • {quickestAppointment.duration} min
                            </div>
                            <div className="text-sm text-gray-600 capitalize">
                              {quickestAppointment.treatmentType} treatment
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-2xl text-blue-600">
                              {getBudgetSymbols(quickestAppointment.treatmentType)}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => onBookAppointment(quickestAppointment)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          size="lg"
                        >
                          <i className="fas fa-bolt mr-2"></i>
                          Book This Appointment
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <i className="fas fa-calendar-times text-4xl text-gray-400 mb-4"></i>
                        <p className="text-gray-600">No appointments available</p>
                        <CallbackRequestModal practiceId={selectedPractice.id} practiceName={selectedPractice.name}>
                          <Button variant="outline" className="mt-4">
                            <PhoneCall className="w-4 h-4 mr-2" />
                            Get notified of cancellations
                          </Button>
                        </CallbackRequestModal>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Status Tracker */}
                {userId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                          <i className="fas fa-clock text-white text-xl"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Booking Status</h3>
                          <p className="text-sm font-normal text-gray-600">
                            Track your current bookings
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => setShowStatusTracker(true)}
                        variant="outline"
                        className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50"
                        size="lg"
                      >
                        <i className="fas fa-search mr-2"></i>
                        Check My Bookings
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Full Diary Access */}
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <i className="fas fa-calendar-alt text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-bold mb-2">View Complete Appointment Diary</h3>
                    <p className="text-gray-600 mb-6">
                      Browse all available appointments across different dates and times
                    </p>
                    <Button
                      onClick={() => setShowFullDiary(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <i className="fas fa-calendar-alt mr-2"></i>
                      Open Full Diary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              {/* Practice Overview */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Meet Our Expert Team</h3>
                    <p className="text-gray-600 mb-4">
                      Our multidisciplinary team of specialists provides comprehensive dental care with cutting-edge technology and compassionate service.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-award text-white"></i>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{practiceData?.dentists?.length || 6} Specialists</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-calendar-check text-white"></i>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Same Day Appts</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-language text-white"></i>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">8+ Languages</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-heart text-white"></i>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Anxiety Care</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dentist Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practiceData?.dentists?.map((dentist) => (
                  <Card key={dentist.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <img 
                        src={dentist.imageUrl} 
                        alt={dentist.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-blue-600 shadow-lg">
                          {dentist.experience} years
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center space-x-1 text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className="fas fa-star text-sm"></i>
                          ))}
                          <span className="text-white text-sm font-medium ml-2">4.9</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{dentist.title} {dentist.name}</h3>
                        <p className="text-blue-600 font-medium text-sm">{dentist.specialization}</p>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-2">
                          <i className="fas fa-graduation-cap text-blue-600 mt-0.5 flex-shrink-0"></i>
                          <span className="text-gray-600 leading-tight">{dentist.qualifications}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-language text-green-600"></i>
                          <span className="text-gray-600">{JSON.parse(dentist.languages).join(", ")}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-calendar text-purple-600"></i>
                          <span className="text-gray-600">{JSON.parse(dentist.availableDays).length} days/week</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mt-4 leading-relaxed">{dentist.bio}</p>
                      
                      <div className="mt-6 space-y-2">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700" 
                          onClick={() => {
                            setSelectedDentist(dentist);
                            setShowFullDiary(true);
                          }}
                        >
                          <i className="fas fa-calendar-alt mr-2"></i>
                          View {dentist.name}'s Diary
                        </Button>
                        
                        {/* Quick book button for earliest available */}
                        <Button 
                          variant="outline" 
                          className="w-full border-blue-200 hover:bg-blue-50"
                          onClick={() => {
                            // Find earliest appointment for this dentist
                            const dentistAppointment = practiceData?.availableAppointments?.find(
                              apt => apt.dentistId === dentist.id
                            );
                            if (dentistAppointment) {
                              onBookAppointment(dentistAppointment);
                            }
                          }}
                        >
                          <i className="fas fa-bolt mr-2"></i>
                          Book Next Available
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Support Staff Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-users text-blue-600"></i>
                    <span>Our Support Team</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: "Rachel Thompson",
                        role: "Practice Manager",
                        image: "https://images.unsplash.com/photo-1494790108755-2616b332e0a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                        description: "Oversees daily operations and patient care coordination"
                      },
                      {
                        name: "Mark Stevens",
                        role: "Senior Dental Hygienist",
                        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                        description: "Specialist in preventative care and oral health education"
                      },
                      {
                        name: "Sophie Miller",
                        role: "Dental Nurse",
                        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                        description: "Patient comfort specialist and treatment support"
                      },
                      {
                        name: "David Wilson",
                        role: "Receptionist",
                        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                        description: "First point of contact and appointment coordination"
                      }
                    ].map((staff, index) => (
                      <div key={index} className="text-center">
                        <img 
                          src={staff.image} 
                          alt={staff.name}
                          className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                        />
                        <h4 className="font-semibold text-gray-900">{staff.name}</h4>
                        <p className="text-sm text-blue-600 font-medium">{staff.role}</p>
                        <p className="text-xs text-gray-600 mt-1">{staff.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-8">
              {practiceServices.map((serviceCategory) => (
                <div key={serviceCategory.category}>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">{serviceCategory.category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviceCategory.treatments.map((treatment, index) => (
                      <Card key={index} className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-600">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-800">{treatment.name}</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">{treatment.duration}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-600 mb-6 leading-relaxed">{treatment.description}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Price</span>
                            <span className="text-2xl font-bold text-blue-600">{treatment.price}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Payment Options */}
              <Card className="bg-blue-50 border-2 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-blue-900">Payment Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <i className="fas fa-credit-card text-3xl text-blue-600 mb-2"></i>
                      <h4 className="font-semibold">Card Payments</h4>
                      <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                    </div>
                    <div className="text-center">
                      <i className="fas fa-calendar-check text-3xl text-blue-600 mb-2"></i>
                      <h4 className="font-semibold">Payment Plans</h4>
                      <p className="text-sm text-gray-600">0% finance available</p>
                    </div>
                    <div className="text-center">
                      <i className="fas fa-shield-alt text-3xl text-blue-600 mb-2"></i>
                      <h4 className="font-semibold">Insurance</h4>
                      <p className="text-sm text-gray-600">Most plans accepted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              {/* Overall Rating */}
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-yellow-600 mb-2">{selectedPractice.rating}</div>
                      <div className="flex justify-center mb-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-6 h-6 ${star <= Math.floor(selectedPractice.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-600">Based on {selectedPractice.reviewCount} reviews</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Rating Breakdown</h3>
                      {[5,4,3,2,1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2 mb-2">
                          <span className="text-sm w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${rating === 5 ? '75%' : rating === 4 ? '20%' : '5%'}` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{rating === 5 ? '185' : rating === 4 ? '49' : '13'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {practiceReviews.map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {review.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold flex items-center space-x-2">
                                <span>{review.name}</span>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    <i className="fas fa-check-circle mr-1"></i>
                                    Verified
                                  </Badge>
                                )}
                              </h4>
                              <p className="text-sm text-gray-500">{review.date}</p>
                            </div>
                            <div className="flex">
                              {[1,2,3,4,5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              {/* Practice Features */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Why Choose Us</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {practiceFeatures.map((feature, index) => (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <i className={`${feature.icon} text-4xl text-blue-600 mb-4`}></i>
                        <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                        <p className="text-gray-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Accessibility Features */}
              <Card className="bg-green-50 border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-800">
                    <Accessibility className="w-6 h-6" />
                    <span>Accessibility Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-wheelchair text-green-600"></i>
                      <span>Full wheelchair access</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-hands text-green-600"></i>
                      <span>BSL interpreter available</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-eye text-green-600"></i>
                      <span>Large print materials</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-brain text-green-600"></i>
                      <span>Cognitive support services</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-parking text-green-600"></i>
                      <span>Disabled parking spaces</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-heart text-green-600"></i>
                      <span>Anxiety support options</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-gray-600">{selectedPractice.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-phone w-5 h-5 text-blue-600"></i>
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-gray-600">{selectedPractice.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Opening Hours</p>
                          <p className="text-gray-600">{selectedPractice.openingHours}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Button className="w-full" size="lg">
                        <i className="fas fa-directions mr-2"></i>
                        Get Directions
                      </Button>
                      <Button variant="outline" className="w-full" size="lg">
                        <i className="fas fa-phone mr-2"></i>
                        Call Practice
                      </Button>
                      <Button variant="outline" className="w-full" size="lg">
                        <i className="fas fa-envelope mr-2"></i>
                        Send Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}