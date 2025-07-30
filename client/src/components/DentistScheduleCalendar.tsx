import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { ScrollArea } from "./ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isSameMonth } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";

interface DentistScheduleCalendarProps {
  practiceId: number;
}

interface CalendarAppointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  treatmentType: string;
  status: string;
  booking?: {
    id: number;
    userId: number;
    approvalStatus: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    triageAssessment?: {
      urgencyLevel: string;
      painLevel: number;
      symptoms: string;
    };
  };
}

export function DentistScheduleCalendar({ practiceId }: DentistScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Fetch all appointments for the practice
  const { data: appointments = [], isLoading } = useQuery<CalendarAppointment[]>({
    queryKey: [`/api/practice/${practiceId}/calendar-appointments`],
    queryFn: async () => {
      // Fetch all appointments with their booking status
      const response = await fetch(`/api/practice/${practiceId}/appointments`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const allAppointments = await response.json();

      // Fetch approved bookings
      const approvedResponse = await fetch(`/api/practice/${practiceId}/approved-bookings`);
      if (!approvedResponse.ok) throw new Error('Failed to fetch approved bookings');
      const approvedBookings = await approvedResponse.json();

      // Fetch pending bookings
      const pendingResponse = await fetch(`/api/practice/${practiceId}/pending-bookings`);
      if (!pendingResponse.ok) throw new Error('Failed to fetch pending bookings');
      const pendingBookings = await pendingResponse.json();

      // Merge appointment data with booking data
      return allAppointments.map((apt: any) => {
        const approvedBooking = approvedBookings.find((b: any) => b.appointmentId === apt.id);
        const pendingBooking = pendingBookings.find((b: any) => b.appointmentId === apt.id);
        const booking = approvedBooking || pendingBooking;

        return {
          ...apt,
          booking: booking ? {
            ...booking,
            user: booking.user || {
              firstName: 'Unknown',
              lastName: 'Patient',
              email: 'N/A',
              phone: 'N/A'
            }
          } : undefined
        };
      });
    }
  });

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.appointmentDate), date)
    );
  };

  // Get status color for appointment
  const getStatusColor = (appointment: CalendarAppointment) => {
    if (!appointment.booking) return "bg-gray-100 text-gray-600";
    if (appointment.booking.approvalStatus === "approved") return "bg-green-100 text-green-700";
    if (appointment.booking.approvalStatus === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return <Badge variant="destructive" className="text-xs">Emergency</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white text-xs">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white text-xs">Medium</Badge>;
      default:
        return <Badge className="bg-green-500 text-white text-xs">Low</Badge>;
    }
  };

  // Calendar statistics
  const stats = {
    totalAppointments: appointments.length,
    approvedAppointments: appointments.filter(apt => apt.booking?.approvalStatus === "approved").length,
    pendingAppointments: appointments.filter(apt => apt.booking?.approvalStatus === "pending").length,
    availableSlots: appointments.filter(apt => !apt.booking).length,
    todayAppointments: getAppointmentsForDate(new Date()).length
  };

  // Render day view
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    const timeSlots = Array.from({ length: 20 }, (_, i) => {
      const hour = Math.floor(i / 2) + 8;
      const minute = i % 2 === 0 ? '00' : '30';
      return `${hour.toString().padStart(2, '0')}:${minute}`;
    });

    return (
      <div className="space-y-2">
        {timeSlots.map(time => {
          const appointment = dayAppointments.find(apt => apt.appointmentTime === time);
          
          return (
            <div key={time} className="flex gap-2">
              <div className="w-16 text-sm text-gray-500 py-2">{time}</div>
              <div className="flex-1">
                {appointment ? (
                  <Card className={cn("p-3", getStatusColor(appointment))}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {appointment.booking ? (
                            <>
                              {appointment.booking.user.firstName} {appointment.booking.user.lastName}
                            </>
                          ) : (
                            "Available Slot"
                          )}
                        </div>
                        {appointment.booking?.triageAssessment && (
                          getUrgencyBadge(appointment.booking.triageAssessment.urgencyLevel)
                        )}
                      </div>
                      
                      {appointment.booking && (
                        <>
                          <div className="text-sm text-gray-600">
                            {appointment.treatmentType} • {appointment.duration} mins
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appointment.booking.user.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {appointment.booking.user.email}
                            </span>
                          </div>
                          {appointment.booking.triageAssessment && (
                            <div className="text-xs text-gray-600 mt-2">
                              Pain Level: {appointment.booking.triageAssessment.painLevel}/10
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                ) : (
                  <div className="h-14 border-2 border-dashed border-gray-200 rounded-lg"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map(day => {
          const dayAppointments = getAppointmentsForDate(day);
          const approved = dayAppointments.filter(apt => apt.booking?.approvalStatus === "approved").length;
          const pending = dayAppointments.filter(apt => apt.booking?.approvalStatus === "pending").length;
          const available = dayAppointments.filter(apt => !apt.booking).length;
          
          return (
            <Card
              key={day.toString()}
              className={cn(
                "p-2 h-24 cursor-pointer hover:bg-gray-50 transition-colors",
                isToday(day) && "ring-2 ring-blue-500",
                !isSameMonth(day, selectedDate) && "opacity-50"
              )}
              onClick={() => {
                setSelectedDate(day);
                setViewMode("day");
              }}
            >
              <div className="space-y-1">
                <div className={cn(
                  "text-sm font-medium",
                  isToday(day) && "text-blue-600"
                )}>
                  {format(day, 'd')}
                </div>
                
                {dayAppointments.length > 0 && (
                  <div className="space-y-1">
                    {approved > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">{approved}</span>
                      </div>
                    )}
                    {pending > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs text-yellow-600">{pending}</span>
                      </div>
                    )}
                    {available > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{available}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedAppointments}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-600">{stats.availableSlots}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Slots</p>
                <p className="text-2xl font-bold">{stats.totalAppointments}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointment Calendar</CardTitle>
              <CardDescription>
                View and manage your appointment schedule
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Selector */}
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                >
                  Month
                </Button>
                <Button
                  variant={viewMode === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                >
                  Day
                </Button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    if (viewMode === "month") {
                      newDate.setMonth(newDate.getMonth() - 1);
                    } else {
                      newDate.setDate(newDate.getDate() - 1);
                    }
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-lg font-medium min-w-[200px] text-center">
                  {viewMode === "month" 
                    ? format(selectedDate, 'MMMM yyyy')
                    : format(selectedDate, 'EEEE, MMMM d, yyyy')
                  }
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    if (viewMode === "month") {
                      newDate.setMonth(newDate.getMonth() + 1);
                    } else {
                      newDate.setDate(newDate.getDate() + 1);
                    }
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  className="ml-2"
                >
                  Today
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {viewMode === "month" ? renderMonthView() : renderDayView()}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span>Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Available Slot</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}