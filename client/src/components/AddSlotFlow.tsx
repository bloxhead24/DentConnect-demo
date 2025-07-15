import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Clock, Timer, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, isSameDay } from "date-fns";

interface AddSlotFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SlotData {
  date: Date | null;
  time: string;
  duration: number;
}

export function AddSlotFlow({ isOpen, onClose, onSuccess }: AddSlotFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [slotData, setSlotData] = useState<SlotData>({
    date: null,
    time: "",
    duration: 30
  });
  const queryClient = useQueryClient();

  const totalSteps = 3;

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/practices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      onSuccess();
      onClose();
      // Reset form
      setCurrentStep(1);
      setSlotData({
        date: null,
        time: "",
        duration: 30
      });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      // Show user-friendly error message
      alert('Failed to create appointment. Please try again.');
    }
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (!slotData.date || !slotData.time) {
      alert('Please fill in all required fields');
      return;
    }

    // Create the appointment date by combining date and time
    const appointmentDateTime = new Date(slotData.date);
    const [hours, minutes] = slotData.time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Create appointment for Dr. Richard's practice (practiceId: 1, dentistId: 1)
    const appointmentData = {
      practiceId: 1, // Dr. Richard's practice
      dentistId: 1, // Dr. Richard
      treatmentId: 1, // Default treatment ID
      appointmentDate: appointmentDateTime.toISOString(),
      appointmentTime: slotData.time,
      duration: slotData.duration,
      treatmentType: 'general', // Default treatment type
      status: 'available'
    };

    console.log("Creating slot with data:", appointmentData);
    createAppointmentMutation.mutate(appointmentData);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Select Date";
      case 2: return "Choose Time";
      case 3: return "Set Duration";
      default: return "";
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return slotData.date !== null;
      case 2: return slotData.time !== "";
      case 3: return slotData.duration > 0;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">Add New Appointment Slot</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Step {currentStep} of {totalSteps}: {getStepTitle()}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step 1: Date Selection */}
          {currentStep === 1 && (
            <DateSelectionStep 
              selectedDate={slotData.date} 
              onDateSelect={(date) => setSlotData({...slotData, date})} 
            />
          )}

          {/* Step 2: Time Selection */}
          {currentStep === 2 && (
            <TimeSelectionStep 
              selectedTime={slotData.time} 
              onTimeSelect={(time) => setSlotData({...slotData, time})} 
              selectedDate={slotData.date}
            />
          )}

          {/* Step 3: Duration Selection */}
          {currentStep === 3 && (
            <DurationSelectionStep 
              selectedDuration={slotData.duration} 
              onDurationSelect={(duration) => setSlotData({...slotData, duration})} 
            />
          )}



          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={!isStepComplete()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={!isStepComplete() || createAppointmentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createAppointmentMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Slot
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step Components
function DateSelectionStep({ selectedDate, onDateSelect }: { 
  selectedDate: Date | null; 
  onDateSelect: (date: Date) => void 
}) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const nextWeek = addWeeks(currentWeek, 1);
  const nextWeekDays = Array.from({ length: 7 }, (_, i) => addDays(nextWeek, i));

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Select the date for your appointment slot</h3>
      </div>
      
      <div className="space-y-6">
        {/* Current Week */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Week of {format(currentWeek, "MMM d, yyyy")}
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <Button
                key={day.toISOString()}
                variant={selectedDate && isSameDay(selectedDate, day) ? "default" : "outline"}
                className={`h-16 flex flex-col items-center justify-center ${
                  selectedDate && isSameDay(selectedDate, day) 
                    ? "bg-blue-600 text-white" 
                    : "hover:bg-blue-50"
                }`}
                onClick={() => onDateSelect(day)}
              >
                <span className="text-xs">{format(day, "EEE")}</span>
                <span className="text-lg font-semibold">{format(day, "d")}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Next Week */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Week of {format(nextWeek, "MMM d, yyyy")}
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {nextWeekDays.map((day) => (
              <Button
                key={day.toISOString()}
                variant={selectedDate && isSameDay(selectedDate, day) ? "default" : "outline"}
                className={`h-16 flex flex-col items-center justify-center ${
                  selectedDate && isSameDay(selectedDate, day) 
                    ? "bg-blue-600 text-white" 
                    : "hover:bg-blue-50"
                }`}
                onClick={() => onDateSelect(day)}
              >
                <span className="text-xs">{format(day, "EEE")}</span>
                <span className="text-lg font-semibold">{format(day, "d")}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeSelectionStep({ selectedTime, onTimeSelect, selectedDate }: { 
  selectedTime: string; 
  onTimeSelect: (time: string) => void;
  selectedDate: Date | null;
}) {
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">
          Choose time for {selectedDate ? format(selectedDate, "EEEE, MMM d, yyyy") : "your appointment"}
        </h3>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {timeSlots.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            className={`h-12 ${
              selectedTime === time 
                ? "bg-blue-600 text-white" 
                : "hover:bg-blue-50"
            }`}
            onClick={() => onTimeSelect(time)}
          >
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
}

function DurationSelectionStep({ selectedDuration, onDurationSelect }: { 
  selectedDuration: number; 
  onDurationSelect: (duration: number) => void 
}) {
  const durations = [
    { value: 15, label: "15 minutes", description: "Quick consultation" },
    { value: 30, label: "30 minutes", description: "Standard appointment" },
    { value: 45, label: "45 minutes", description: "Extended consultation" },
    { value: 60, label: "1 hour", description: "Complex treatment" },
    { value: 90, label: "1.5 hours", description: "Major procedure" },
    { value: 120, label: "2 hours", description: "Comprehensive treatment" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Timer className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">How long should this appointment slot be?</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {durations.map((duration) => (
          <Button
            key={duration.value}
            variant={selectedDuration === duration.value ? "default" : "outline"}
            className={`h-16 flex flex-col items-center justify-center ${
              selectedDuration === duration.value 
                ? "bg-blue-600 text-white" 
                : "hover:bg-blue-50"
            }`}
            onClick={() => onDurationSelect(duration.value)}
          >
            <span className="font-semibold">{duration.label}</span>
            <span className="text-xs opacity-75">{duration.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

