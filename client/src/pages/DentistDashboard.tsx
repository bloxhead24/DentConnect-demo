import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DentConnectLogo } from "../components/DentConnectLogo";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Link } from "wouter";
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Bell,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface DentistUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  practiceId: number;
}

interface Appointment {
  id: number;
  practiceId: number;
  dentistId: number;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  treatmentType: string;
  isAvailable: boolean;
  price: number;
  patientName?: string;
  patientEmail?: string;
}

interface Practice {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  practiceTag: string;
}

export default function DentistDashboard() {
  const [user, setUser] = useState<DentistUser | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "slots" | "settings">("overview");
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('dentist_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if no user found
      window.location.href = '/dentist-login';
    }
  }, []);

  const { data: practice } = useQuery({
    queryKey: ['/api/practices', user?.practiceId],
    queryFn: async () => {
      if (!user?.practiceId) return null;
      return await apiRequest(`/api/practices/${user.practiceId}`);
    },
    enabled: !!user?.practiceId,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['/api/appointments', user?.practiceId],
    queryFn: async () => {
      if (!user?.practiceId) return [];
      return await apiRequest(`/api/appointments/${user.practiceId}`);
    },
    enabled: !!user?.practiceId,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['/api/bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await apiRequest(`/api/bookings/dentist/${user.id}`);
    },
    enabled: !!user?.id,
  });

  const handleLogout = () => {
    localStorage.removeItem('dentist_session');
    localStorage.removeItem('dentist_user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    window.location.href = '/dentist-login';
  };

  const totalAppointments = appointments.length;
  const bookedAppointments = appointments.filter((apt: Appointment) => !apt.isAvailable).length;
  const availableSlots = appointments.filter((apt: Appointment) => apt.isAvailable).length;
  const todaysAppointments = appointments.filter((apt: Appointment) => {
    const appointmentDate = new Date(apt.appointmentDate);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  }).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <DentConnectLogo className="mr-6" width={140} height={35} />
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">Dentist Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, Dr. {user.firstName} {user.lastName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Practice Info */}
      {practice && (
        <div className="bg-teal-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-teal-900">{practice.name}</h2>
                <p className="text-sm text-teal-700">{practice.address}</p>
              </div>
              <Badge variant="outline" className="text-teal-700 border-teal-300">
                Tag: {practice.practiceTag}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="slots">Manage Slots</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAppointments}</div>
                  <p className="text-xs text-muted-foreground">All time slots</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Booked Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todaysAppointments}</div>
                  <p className="text-xs text-muted-foreground">Today's appointments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availableSlots}</div>
                  <p className="text-xs text-muted-foreground">Open for booking</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Booked Slots</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookedAppointments}</div>
                  <p className="text-xs text-muted-foreground">Patient confirmed</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your practice efficiently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="justify-start h-auto p-4 bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Add Appointment Slot</div>
                      <div className="text-sm opacity-90">Create new available time slots</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <Activity className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">View Analytics</div>
                      <div className="text-sm text-muted-foreground">Check booking patterns</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <Settings className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Practice Settings</div>
                      <div className="text-sm text-muted-foreground">Update practice information</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest bookings and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent bookings to display</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">{booking.patientName || 'Patient'}</p>
                            <p className="text-sm text-gray-600">{booking.treatmentType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{booking.appointmentTime}</p>
                          <p className="text-xs text-gray-500">{new Date(booking.appointmentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>View and manage your appointment schedule</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments scheduled yet</p>
                    <Button className="mt-4 bg-teal-600 hover:bg-teal-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment: Appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {appointment.isAvailable ? (
                                <Clock className="h-5 w-5 text-blue-600" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{appointment.treatmentType}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                              </p>
                              {appointment.patientName && (
                                <p className="text-sm text-gray-600">Patient: {appointment.patientName}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={appointment.isAvailable ? "outline" : "default"}>
                              {appointment.isAvailable ? "Available" : "Booked"}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">£{appointment.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Appointment Slots</CardTitle>
                <CardDescription>Add, edit, or remove appointment availability</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is a demo version. In the full version, you would be able to add and manage appointment slots here.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-6">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Slot
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Settings</CardTitle>
                <CardDescription>Manage your practice information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is a demo version. In the full version, you would be able to update practice settings here.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <Link href="/" className="text-teal-600 hover:text-teal-700">
              ← Back to Patient Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}