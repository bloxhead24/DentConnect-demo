import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import DentConnectLogo from "@/components/DentConnectLogo";
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
  Bell
} from "lucide-react";

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
      {/* Enhanced Header with Navigation and Badges */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <DentConnectLogo width={180} height={35} />
                <div className="h-8 w-px bg-gray-300" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Dentist Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome back, Dr. Anderson</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Return to Patient Side Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = "/"}
                  className="text-primary border-primary/30 hover:bg-primary/10 transition-all duration-300"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Patient View
                </Button>
                
                {/* Professional Early Access Button */}
                <Button 
                  onClick={() => window.location.href = "/early-access"}
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md border-0"
                  size="sm"
                >
                  <i className="fas fa-star mr-2"></i>
                  Early Access
                </Button>
                
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300" />
                  <AvatarFallback>DA</AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            {/* Royal College of Surgeons Badge */}
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-award text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      🏆 Nominated for Innovation Award
                    </p>
                    <p className="text-xs text-blue-600">
                      Royal College of Surgeons - National Contribution to Dentistry 2024
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
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
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Appointments</CardTitle>
                  <CardDescription>Your scheduled appointments for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentAppointments?.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.patientName}</p>
                            <p className="text-sm text-gray-600">{appointment.treatmentType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{appointment.appointmentTime}</p>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Appointments
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your practice efficiently</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
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
                    <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                      <PhoneCall className="h-6 w-6" />
                      <span className="text-sm">Emergency</span>
                    </Button>
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
            <Card>
              <CardHeader>
                <CardTitle>Schedule Management</CardTitle>
                <CardDescription>Manage your availability and time slots</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Schedule management interface would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}