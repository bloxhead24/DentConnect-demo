import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Eye,
  Edit,
  MoreVertical,
  Stethoscope,
  FileText,
  MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface AppointmentManagementProps {
  practiceId: number;
}

export function AppointmentManagement({ practiceId }: AppointmentManagementProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  // Fetch appointments with bookings
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/practice", practiceId, "appointments", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/practice/${practiceId}/appointments`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mark booking fee as collected
  const markFeeCollectedMutation = useMutation({
    mutationFn: async ({ bookingId, collected }: { bookingId: number, collected: boolean }) => {
      const response = await fetch(`/api/bookings/${bookingId}/fee-collected`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeCollected: collected })
      });
      if (!response.ok) throw new Error("Failed to update fee status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice", practiceId, "appointments"] });
      toast({
        title: "Fee Status Updated",
        description: "The booking fee status has been updated successfully.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked": return "bg-green-100 text-green-800 border-green-200";
      case "available": return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default: return null;
    }
  };

  const filteredAppointments = appointments?.filter((apt: any) => {
    const matchesSearch = searchTerm === "" || 
      apt.bookings?.some((booking: any) => 
        booking.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const appointmentsByTime = filteredAppointments?.reduce((acc: any, apt: any) => {
    const time = apt.appointmentTime;
    if (!acc[time]) acc[time] = [];
    acc[time].push(apt);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointment Management</CardTitle>
              <CardDescription>
                Manage your appointments, track booking fees, and patient information
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewType === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("list")}
              >
                List View
              </Button>
              <Button
                variant={viewType === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("calendar")}
              >
                Calendar View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {viewType === "list" && (
        <div className="space-y-4">
          {Object.entries(appointmentsByTime || {}).map(([time, apts]: [string, any]) => (
            <Card key={time}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    {time}
                  </h3>
                  <Badge variant="outline">
                    {(apts as any[]).length} appointment{(apts as any[]).length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(apts as any[]).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <Badge variant="outline">
                              {appointment.treatmentType}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {appointment.duration} mins
                            </span>
                          </div>
                          
                          {appointment.bookings && appointment.bookings.length > 0 ? (
                            appointment.bookings.map((booking: any) => (
                              <div key={booking.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                      <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {booking.user?.firstName} {booking.user?.lastName}
                                      </p>
                                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                                        <span className="flex items-center">
                                          <Mail className="h-3 w-3 mr-1" />
                                          {booking.user?.email}
                                        </span>
                                        <span className="flex items-center">
                                          <Phone className="h-3 w-3 mr-1" />
                                          {booking.user?.phone}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getApprovalStatusIcon(booking.approvalStatus)}
                                    <span className="text-sm font-medium">
                                      {booking.approvalStatus}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Booking Fee Status */}
                                {booking.approvalStatus === 'approved' && (
                                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center space-x-2">
                                      <CreditCard className="h-4 w-4 text-gray-600" />
                                      <span className="text-sm font-medium">Booking Fee (£5)</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {new Date(appointment.appointmentDate) < new Date() ? (
                                        <Checkbox
                                          id={`fee-${booking.id}`}
                                          checked={booking.feeCollected || false}
                                          onCheckedChange={(checked) => {
                                            markFeeCollectedMutation.mutate({
                                              bookingId: booking.id,
                                              collected: checked as boolean
                                            });
                                          }}
                                          className="data-[state=checked]:bg-green-600"
                                        />
                                      ) : (
                                        <Badge variant="outline" className="text-xs">
                                          Pending appointment
                                        </Badge>
                                      )}
                                      <label
                                        htmlFor={`fee-${booking.id}`}
                                        className={`text-sm font-medium cursor-pointer ${
                                          booking.feeCollected ? 'text-green-600' : 'text-gray-600'
                                        }`}
                                      >
                                        {booking.feeCollected ? 'Collected' : 'Not collected'}
                                      </label>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No bookings for this slot</p>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowDetails(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Appointment
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            {appointment.bookings?.[0]?.triageAssessmentId && (
                              <DropdownMenuItem>
                                <Stethoscope className="h-4 w-4 mr-2" />
                                View Triage
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Appointment Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about this appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Add detailed appointment information here */}
              <pre className="text-xs">{JSON.stringify(selectedAppointment, null, 2)}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}