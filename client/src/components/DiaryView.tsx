import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { format, addDays, startOfWeek, addWeeks } from "date-fns";
import { Practice, Appointment, Dentist } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { cn } from "../lib/utils";

interface DiaryViewProps {
  practice: Practice;
  dentist?: Dentist;
  searchMode: "practice" | "mydentist";
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (appointment: Appointment) => void;
}

export function DiaryView({ practice, dentist, searchMode, isOpen, onClose, onBookAppointment }: DiaryViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(dentist || null);

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments/${practice.id}`],
    enabled: !!practice && isOpen,
  });

  const { data: practiceDentists = [] } = useQuery<Dentist[]>({
    queryKey: [`/api/dentists/practice/${practice.id}`],
    enabled: !!practice && isOpen && searchMode === "practice",
  });

  // Filter appointments based on search mode and selected date
  const filteredAppointments = appointments.filter(appointment => {
    // Use appointmentDate property only
    const appointmentDateStr = appointment.appointmentDate;
    if (!appointmentDateStr) return false;
    
    const appointmentDate = new Date(appointmentDateStr);
    if (isNaN(appointmentDate.getTime())) return false;
    
    const isSameDate = appointmentDate.toDateString() === selectedDate.toDateString();
    
    if (searchMode === "mydentist" && selectedDentist) {
      return isSameDate && appointment.dentistId === selectedDentist.id;
    }
    
    if (searchMode === "practice" && selectedDentist) {
      return isSameDate && appointment.dentistId === selectedDentist.id;
    }
    
    return isSameDate;
  });

  const getWeekDays = (date: Date) => {
    const startOfCurrentWeek = startOfWeek(date, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  };

  const weekDays = getWeekDays(selectedDate);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  const getAppointmentForSlot = (date: Date, timeSlot: string) => {
    return appointments.find(apt => {
      const appointmentDateStr = apt.appointmentDate;
      if (!appointmentDateStr) return false;
      
      const aptDate = new Date(appointmentDateStr);
      if (isNaN(aptDate.getTime())) return false;
      
      const aptTime = apt.appointmentTime;
      return aptDate.toDateString() === date.toDateString() && aptTime === timeSlot;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                searchMode === "mydentist" ? "bg-teal-600" : "bg-blue-600"
              )}>
                <i className={cn(
                  "text-white text-lg",
                  searchMode === "mydentist" ? "fas fa-user-md" : "fas fa-building"
                )}></i>
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {searchMode === "mydentist" && selectedDentist
                    ? selectedDentist.name
                    : practice.name
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  {searchMode === "mydentist" 
                    ? "Personal Dentist Diary" 
                    : selectedDentist 
                      ? `${selectedDentist.name} - Appointment Diary` 
                      : "Practice Appointment Diary"
                  }
                </p>
              </div>
            </DialogTitle>
            
            <Button variant="outline" size="sm" onClick={onClose}>
              <i className="fas fa-times mr-2"></i>
              Close
            </Button>
          </div>
        </DialogHeader>

        {/* Demo Notice - Compact */}
        <div className="bg-amber-50/80 border border-amber-200 rounded p-2 mb-3">
          <p className="text-xs text-amber-700 text-center">
            <i className="fas fa-info-circle mr-1"></i>
            <strong>Demo:</strong> No real bookings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area - Schedule First */}
          <div className="flex-1 order-2 lg:order-1">
            {/* Appointments Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {viewMode === "week" ? "Weekly Schedule" : `Appointments - ${format(selectedDate, 'EEEE, MMMM d, yyyy')}`}
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === "week" ? (
                  <div className="space-y-4">
                    {/* Week Header */}
                    <div className="grid grid-cols-8 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                      <div>Time</div>
                      {weekDays.map((day, index) => (
                        <div key={index} className="text-center">
                          <div>{format(day, 'EEE')}</div>
                          <div className="text-xs text-gray-500">{format(day, 'd')}</div>
                        </div>
                      ))}
                    </div>

                    {/* Time Slots */}
                    <div className="max-h-[60vh] overflow-y-auto">
                      {timeSlots.map((timeSlot) => (
                        <div key={timeSlot} className="grid grid-cols-8 gap-2 py-1 border-b border-gray-100">
                          <div className="text-sm text-gray-600 py-3 font-medium">{timeSlot}</div>
                          {weekDays.map((day, dayIndex) => {
                            const appointment = getAppointmentForSlot(day, timeSlot);
                            return (
                              <div key={dayIndex} className="min-h-12 p-1">
                                {appointment ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-full p-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 flex flex-col items-center justify-center"
                                    onClick={() => onBookAppointment(appointment)}
                                  >
                                    <div className="font-medium text-green-700">Available</div>
                                    <div className="text-xs text-green-600">{appointment.duration}min</div>
                                  </Button>
                                ) : (
                                  <div className="w-full h-12 bg-gray-50 rounded border border-gray-200"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAppointments.map((appointment) => (
                          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <i className="fas fa-clock text-green-600 text-sm"></i>
                                  </div>
                                  <div>
                                    <div className="font-bold text-lg">{appointment.appointmentTime}</div>
                                    <div className="text-xs text-gray-500">{appointment.duration} minutes</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {appointment.treatmentType}
                                </Badge>
                              </div>
                              
                              <Button
                                onClick={() => onBookAppointment(appointment)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                <i className="fas fa-calendar-check mr-2"></i>
                                Book Appointment
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-calendar-times text-2xl text-gray-400"></i>
                        </div>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No appointments available</h3>
                        <p className="text-sm">
                          {selectedDentist 
                            ? `${selectedDentist.name} has no appointments available on this date.`
                            : "No appointments available on this date."
                          }
                        </p>
                        <p className="text-sm mt-2">Try selecting a different date or dentist.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Controls - Options on the right */}
          <div className="w-full lg:w-80 order-1 lg:order-2 space-y-4">
            {/* View Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">View Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                    className="justify-start"
                  >
                    <i className="fas fa-calendar-week mr-2"></i>
                    Week View
                  </Button>
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                    className="justify-start"
                  >
                    <i className="fas fa-list mr-2"></i>
                    Day View
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border w-full"
                />
              </CardContent>
            </Card>

            {/* Dentist Filter (Practice Mode Only) */}
            {searchMode === "practice" && practiceDentists.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Filter by Dentist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={!selectedDentist ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDentist(null)}
                      className="justify-start"
                    >
                      <i className="fas fa-users mr-2"></i>
                      All Dentists
                    </Button>
                    {practiceDentists.map((dentist) => (
                      <Button
                        key={dentist.id}
                        variant={selectedDentist?.id === dentist.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDentist(dentist)}
                        className="justify-start"
                      >
                        <i className="fas fa-user-md mr-2"></i>
                        {dentist.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}