import { useState } from "react";
import { AppointmentApprovalDashboard } from "../components/AppointmentApprovalDashboard";
import { ApprovedAppointmentsOverview } from "../components/ApprovedAppointmentsOverview";
import { CallbackRequestsOverview } from "../components/CallbackRequestsOverview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import DentConnectLogo from "../components/DentConnectLogo";
import { VirtualConsultation } from "../components/VirtualConsultation";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  Star, 
  PhoneCall,
  FileText,
  Settings,
  BarChart3,
  DollarSign,
  Activity,
  Bell,
  Video,
  LogOut
} from "lucide-react";
import PricingManagement from "../components/PricingManagement";
import { AddSlotFlow } from "../components/AddSlotFlow";
import EnhancedSlotCreation from "../components/EnhancedSlotCreation";
import { DentistScheduleCalendar } from "../components/DentistScheduleCalendar";

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  averageRating: number;
  cancelledAppointments: number;
  completedAppointments: number;
  pendingBookings: number;
  availableSlots: number;
}

interface RecentAppointment {
  id: number;
  patientName: string;
  treatmentType: string;
  appointmentTime: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  revenue: number;
}

export default function DentistDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  const [showVirtualConsultation, setShowVirtualConsultation] = useState(false);
  const [showAddSlotFlow, setShowAddSlotFlow] = useState(false);
  const [showEnhancedSlotCreation, setShowEnhancedSlotCreation] = useState(false);
  
  // Get logged-in user info
  const userStr = sessionStorage.getItem('dentconnect_user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    user = null;
  }
  
  const handleLogout = () => {
    sessionStorage.removeItem('dentconnect_user');
    window.location.href = '/login';
  };

  // Mock data - in real app, these would come from API
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dentist/stats", selectedPeriod],
    queryFn: async () => ({
      totalPatients: 1247,
      todayAppointments: 8,
      monthlyRevenue: 18500,
      averageRating: 4.8,
      cancelledAppointments: 12,
      completedAppointments: 156,
      pendingBookings: 23,
      availableSlots: 15,
    }),
  });

  const { data: recentAppointments } = useQuery<RecentAppointment[]>({
    queryKey: ["/api/dentist/recent-appointments"],
    queryFn: async () => ([
      {
        id: 1,
        patientName: "Sarah Johnson",
        treatmentType: "Routine Cleaning",
        appointmentTime: "09:00",
        status: "scheduled",
        revenue: 80,
      },
      {
        id: 2,
        patientName: "Michael Chen",
        treatmentType: "Tooth Filling",
        appointmentTime: "10:30",
        status: "completed",
        revenue: 150,
      },
      {
        id: 3,
        patientName: "Emma Wilson",
        treatmentType: "Root Canal",
        appointmentTime: "14:00",
        status: "scheduled",
        revenue: 400,
      },
      {
        id: 4,
        patientName: "James Brown",
        treatmentType: "Emergency Treatment",
        appointmentTime: "16:30",
        status: "cancelled",
        revenue: 0,
      },
    ]),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "no-show": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Link href="/">
                <DentConnectLogo width={160} height={32} className="cursor-pointer" />
              </Link>
              <div className="hidden md:block h-6 w-px bg-gray-300" />
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900">Dentist Dashboard</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Welcome, {user?.firstName} {user?.lastName}</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                    DRRICHARD
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Early Access Button */}
              <Button 
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
                className="bg-blue-600 text-white hover:bg-blue-700 hidden md:flex items-center"
                size="sm"
              >
                <Star className="h-4 w-4 mr-2" />
                Early Access
              </Button>
              
              {/* Patient View Button */}
              <Link href="/">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-primary border-primary hover:bg-primary hover:text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Patient View</span>
                </Button>
              </Link>
              
              {/* Logout Button */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12%</span>
                <span className="text-gray-500 ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+5%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">£{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+8%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600">Excellent</span>
                <span className="text-gray-500 ml-1">rating</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-6">
            <AppointmentApprovalDashboard practiceId={1} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Approved Appointments Overview */}
            <ApprovedAppointmentsOverview practiceId={1} />

            {/* Callback Requests Overview */}
            <CallbackRequestsOverview practiceId={1} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your practice efficiently</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => setShowVirtualConsultation(true)}
                      className="h-20 flex flex-col items-center space-y-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <Video className="h-6 w-6" />
                      <span className="text-sm font-medium">Virtual Consult</span>
                    </Button>
                    <Button 
                      onClick={() => setShowEnhancedSlotCreation(true)}
                      variant="outline" 
                      className="h-20 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">Add Slot</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Patient List</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-sm">Reports</span>
                    </Button>
                  </div>
                  
                  {/* Virtual Consultation Fee Note */}
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-700 text-center">
                      <strong>💰 Virtual Consultation Earnings</strong>
                      <br />
                      You earn £20 per 30-minute session
                      <br />
                      <span className="text-green-600">Patients pay £24.99 • Instant payment processing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Practice Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Practice Summary</CardTitle>
                  <CardDescription>Your practice performance at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Approved Appointments</span>
                      <span className="font-semibold">{stats.completedAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending Approvals</span>
                      <span className="font-semibold">{stats.pendingBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Available Slots</span>
                      <span className="font-semibold">{stats.availableSlots}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monthly Revenue</span>
                      <span className="font-semibold">£{stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92.8%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                  <div className="mt-4 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: "92.8%" }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5.2%</div>
                  <p className="text-xs text-muted-foreground">
                    -0.8% from last month
                  </p>
                  <div className="mt-4 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-red-400 rounded-full" style={{ width: "5.2%" }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Revenue/Patient</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">£148</div>
                  <p className="text-xs text-muted-foreground">
                    +£12 from last month
                  </p>
                  <div className="mt-4 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: "74%" }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>Manage your appointment schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Appointment management interface would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <PricingManagement />
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>View and manage your patients</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Patient management interface would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Practice Analytics</CardTitle>
                <CardDescription>Detailed insights about your practice</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <DentistScheduleCalendar practiceId={1} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Virtual Consultation Modal */}
      <VirtualConsultation
        isOpen={showVirtualConsultation}
        onClose={() => setShowVirtualConsultation(false)}
        userType="dentist"
        onSuccess={() => setShowVirtualConsultation(false)}
      />

      {/* Add Slot Flow Modal */}
      <AddSlotFlow
        isOpen={showAddSlotFlow}
        onClose={() => setShowAddSlotFlow(false)}
        onSuccess={() => {
          setShowAddSlotFlow(false);
          // You could add a success toast here
        }}
      />

      {/* Enhanced Slot Creation Modal */}
      <EnhancedSlotCreation
        isOpen={showEnhancedSlotCreation}
        onClose={() => setShowEnhancedSlotCreation(false)}
      />

      {/* Floating Royal College of Surgeons Badge */}
      <div className="fixed bottom-6 left-6 z-40 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
        <div className="bg-white/95 backdrop-blur-md border border-blue-200 rounded-2xl px-4 py-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 max-w-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-award text-white text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-xs font-bold text-blue-800 truncate">
                  🏆 Excellence in Patient Care
                </p>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
              </div>
              <p className="text-xs text-blue-600 leading-tight">
                Royal College of Surgeons 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}