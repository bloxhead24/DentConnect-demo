import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import { Card } from "../components/ui/card";
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

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments/${practice.id}`],
    enabled: !!practice && isOpen,
  });

  // Filter appointments based on search mode and selected date
  const filteredAppointments = appointments.filter(appointment => {
    // Handle both dateTime and appointmentDate properties
    const appointmentDateStr = appointment.dateTime || appointment.appointmentDate;
    if (!appointmentDateStr) return false;
    
    const appointmentDate = new Date(appointmentDateStr);
    if (isNaN(appointmentDate.getTime())) return false;
    
    const isSameDate = appointmentDate.toDateString() === selectedDate.toDateString();
    
    if (searchMode === "mydentist" && dentist) {
      return isSameDate && appointment.dentistId === dentist.id;
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
      const appointmentDateStr = apt.dateTime || apt.appointmentDate;
      if (!appointmentDateStr) return false;
      
      const aptDate = new Date(appointmentDateStr);
      if (isNaN(aptDate.getTime())) return false;
      
      const aptTime = format(aptDate, 'HH:mm');
      return aptDate.toDateString() === date.toDateString() && aptTime === timeSlot;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3">
              {searchMode === "mydentist" && dentist ? (
                <>
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-md text-white text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Dr. {dentist.firstName} {dentist.lastName}</h3>
                    <p className="text-sm text-gray-600">Personal Dentist Diary</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-building text-white text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{practice.name}</h3>
                    <p className="text-sm text-gray-600">Practice Appointment Diary</p>
                  </div>
                </>
              )}
            </DialogTitle>
            
            <div className="flex items-center space-x-2">
              <Badge className={cn(
                searchMode === "mydentist" 
                  ? "bg-teal-600 text-white" 
                  : "bg-blue-600 text-white"
              )}>
                {searchMode === "mydentist" ? "My Dentist" : "My Practice"}
              </Badge>
              <Button variant="outline" size="sm" onClick={onClose}>
                <i className="fas fa-times mr-2"></i>
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Calendar Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium mb-3">Select Date</h4>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-3">View Options</h4>
              <div className="space-y-2">
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setViewMode("week")}
                >
                  <i className="fas fa-calendar-week mr-2"></i>
                  Week View
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setViewMode("month")}
                >
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Month View
                </Button>
              </div>
            </Card>
          </div>

          {/* Appointment Grid */}
          <div className="md:col-span-2">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">
                  {viewMode === "week" ? "Weekly Schedule" : "Monthly Overview"}
                </h4>
                <Badge variant="outline">
                  {format(selectedDate, 'MMMM yyyy')}
                </Badge>
              </div>

              {viewMode === "week" ? (
                <div className="space-y-4">
                  {/* Week Header */}
                  <div className="grid grid-cols-8 gap-2 text-sm">
                    <div className="font-medium text-gray-600">Time</div>
                    {weekDays.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="font-medium">{format(day, 'EEE')}</div>
                        <div className="text-xs text-gray-500">{format(day, 'd')}</div>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="max-h-96 overflow-y-auto space-y-1">
                    {timeSlots.map((timeSlot) => (
                      <div key={timeSlot} className="grid grid-cols-8 gap-2">
                        <div className="text-sm text-gray-600 py-2">{timeSlot}</div>
                        {weekDays.map((day, dayIndex) => {
                          const appointment = getAppointmentForSlot(day, timeSlot);
                          return (
                            <div key={dayIndex} className="min-h-10">
                              {appointment ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-full p-1 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                                  onClick={() => onBookAppointment(appointment)}
                                >
                                  <div className="text-center">
                                    <div className="font-medium">Available</div>
                                  </div>
                                </Button>
                              ) : (
                                <div className="w-full h-10 bg-gray-100 rounded border-2 border-dashed border-gray-300"></div>
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
                  <p className="text-sm text-gray-600">
                    Select a date from the calendar to view available appointments for that day.
                  </p>
                  
                  {selectedDate && (
                    <div className="space-y-3">
                      <h5 className="font-medium">
                        Appointments for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </h5>
                      
                      {filteredAppointments.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {filteredAppointments.map((appointment) => (
                            <Button
                              key={appointment.id}
                              variant="outline"
                              className="p-3 h-auto bg-green-50 hover:bg-green-100 border-green-200"
                              onClick={() => onBookAppointment(appointment)}
                            >
                              <div className="text-center">
                                <div className="font-medium">
                                  {format(new Date(appointment.dateTime), 'h:mm a')}
                                </div>
                                <div className="text-xs opacity-80">Available</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fas fa-calendar-times text-2xl mb-2"></i>
                          <p>No appointments available on this date</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}