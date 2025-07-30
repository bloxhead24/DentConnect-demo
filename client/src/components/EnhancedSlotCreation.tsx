import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import { useToast } from "../hooks/use-toast";
import { format, addDays, addWeeks, startOfWeek, isSameDay } from "date-fns";
import { Calendar, Clock, Repeat, Info, ChevronRight, ArrowLeft, Plus, CheckCircle, Zap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EnhancedSlotCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreationMode = 'single' | 'bulk' | 'recurring';
type CreationStep = 'mode' | 'details' | 'preview' | 'success';

interface SlotTemplate {
  name: string;
  duration: number;
  treatmentType: string;
  icon: string;
}

const slotTemplates: SlotTemplate[] = [
  { name: "Check-up", duration: 30, treatmentType: "routine", icon: "🦷" },
  { name: "Emergency", duration: 45, treatmentType: "emergency", icon: "🚨" },
  { name: "Cleaning", duration: 60, treatmentType: "routine", icon: "✨" },
  { name: "Consultation", duration: 20, treatmentType: "consultation", icon: "💬" },
  { name: "Treatment", duration: 90, treatmentType: "treatment", icon: "🔧" }
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export default function EnhancedSlotCreation({ isOpen, onClose }: EnhancedSlotCreationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<CreationStep>('mode');
  const [creationMode, setCreationMode] = useState<CreationMode>('single');
  const [selectedTemplate, setSelectedTemplate] = useState<SlotTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    // Single slot
    date: format(new Date(), 'yyyy-MM-dd'),
    time: "09:00",
    duration: 30,
    treatmentType: "routine",
    
    // Bulk slots
    bulkDates: [] as string[],
    bulkTimes: [] as string[],
    
    // Recurring slots
    recurringStartDate: format(new Date(), 'yyyy-MM-dd'),
    recurringEndDate: format(addWeeks(new Date(), 4), 'yyyy-MM-dd'),
    recurringDays: [] as number[], // 0 = Sunday, 1 = Monday, etc.
    recurringTimes: [] as string[],
  });

  const [previewSlots, setPreviewSlots] = useState<Array<{
    date: string;
    time: string;
    duration: number;
    treatmentType: string;
  }>>([]);

  const createSlotsMutation = useMutation({
    mutationFn: async (slots: typeof previewSlots) => {
      const dentist = JSON.parse(sessionStorage.getItem('dentconnect_user') || '{}');
      
      const promises = slots.map(slot => 
        fetch('/api/appointments', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('dentconnect_token')}`
          },
          body: JSON.stringify({
            ...slot,
            practiceId: dentist.practiceId || 1,
            dentistId: dentist.id || 1
          })
        })
      );
      
      const responses = await Promise.all(promises);
      
      if (responses.some(r => !r.ok)) {
        throw new Error('Failed to create some slots');
      }
      
      return await Promise.all(responses.map(r => r.json()));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/practice'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setCurrentStep('success');
      toast({
        title: "Slots created successfully!",
        description: `Created ${previewSlots.length} appointment slot${previewSlots.length > 1 ? 's' : ''}`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to create slots",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  const getStepIndex = (): number => {
    const steps: CreationStep[] = ['mode', 'details', 'preview', 'success'];
    return steps.indexOf(currentStep);
  };

  const totalSteps = 3;
  const progressPercentage = ((getStepIndex() + 1) / totalSteps) * 100;

  const handleModeSelection = (mode: CreationMode) => {
    setCreationMode(mode);
    setCurrentStep('details');
  };

  const generatePreviewSlots = () => {
    let slots: typeof previewSlots = [];
    
    switch (creationMode) {
      case 'single':
        slots = [{
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          treatmentType: formData.treatmentType
        }];
        break;
      
      case 'bulk':
        formData.bulkDates.forEach(date => {
          formData.bulkTimes.forEach(time => {
            slots.push({
              date,
              time,
              duration: formData.duration,
              treatmentType: formData.treatmentType
            });
          });
        });
        break;
      
      case 'recurring':
        const startDate = new Date(formData.recurringStartDate);
        const endDate = new Date(formData.recurringEndDate);
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();
          if (formData.recurringDays.includes(dayOfWeek)) {
            formData.recurringTimes.forEach(time => {
              slots.push({
                date: format(currentDate, 'yyyy-MM-dd'),
                time,
                duration: formData.duration,
                treatmentType: formData.treatmentType
              });
            });
          }
          currentDate = addDays(currentDate, 1);
        }
        break;
    }
    
    setPreviewSlots(slots);
    setCurrentStep('preview');
  };

  const handleTemplateSelect = (template: SlotTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      duration: template.duration,
      treatmentType: template.treatmentType
    });
  };

  const renderModeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">How would you like to create slots?</h3>
        <p className="text-gray-600">Choose the best option for your scheduling needs</p>
      </div>

      <div className="grid gap-4">
        <Card 
          className="cursor-pointer hover:border-teal-500 transition-colors"
          onClick={() => handleModeSelection('single')}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Single Slot</h4>
                <p className="text-sm text-gray-600">Create one appointment slot</p>
                <p className="text-xs text-gray-500 mt-1">Best for: Last-minute openings</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-teal-500 transition-colors"
          onClick={() => handleModeSelection('bulk')}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Bulk Creation</h4>
                <p className="text-sm text-gray-600">Create multiple slots at once</p>
                <p className="text-xs text-gray-500 mt-1">Best for: Setting up a new week</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-teal-500 transition-colors"
          onClick={() => handleModeSelection('recurring')}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Repeat className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Recurring Schedule</h4>
                <p className="text-sm text-gray-600">Set up repeating weekly slots</p>
                <p className="text-xs text-gray-500 mt-1">Best for: Regular availability patterns</p>
              </div>
              <Badge className="bg-amber-100 text-amber-800">Save Time</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {creationMode === 'single' && 'Create Single Slot'}
          {creationMode === 'bulk' && 'Create Multiple Slots'}
          {creationMode === 'recurring' && 'Set Recurring Schedule'}
        </h3>
        
        {/* Quick Templates */}
        <div className="mb-6">
          <Label className="mb-2 block">Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            {slotTemplates.map((template) => (
              <Button
                key={template.name}
                variant={selectedTemplate?.name === template.name ? "default" : "outline"}
                size="sm"
                onClick={() => handleTemplateSelect(template)}
                className="text-xs"
              >
                <span className="mr-1">{template.icon}</span>
                {template.name} ({template.duration}min)
              </Button>
            ))}
          </div>
        </div>

        {/* Mode-specific inputs */}
        {creationMode === 'single' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="time">Time</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData({ ...formData, time: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {creationMode === 'bulk' && (
          <div className="space-y-4">
            <div>
              <Label>Select Dates</Label>
              <div className="grid grid-cols-7 gap-1 mt-2">
                {[...Array(14)].map((_, i) => {
                  const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
                  const isSelected = formData.bulkDates.includes(date);
                  return (
                    <Button
                      key={date}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            bulkDates: formData.bulkDates.filter(d => d !== date)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            bulkDates: [...formData.bulkDates, date]
                          });
                        }
                      }}
                      className="text-xs p-2"
                    >
                      {format(addDays(new Date(), i), 'd')}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <Label>Select Times</Label>
              <div className="grid grid-cols-4 gap-2 mt-2 max-h-48 overflow-y-auto">
                {timeSlots.map(time => {
                  const isSelected = formData.bulkTimes.includes(time);
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            bulkTimes: formData.bulkTimes.filter(t => t !== time)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            bulkTimes: [...formData.bulkTimes, time]
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {creationMode === 'recurring' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.recurringStartDate}
                  onChange={(e) => setFormData({ ...formData, recurringStartDate: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.recurringEndDate}
                  onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                  min={formData.recurringStartDate}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Repeat on days</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                  const isSelected = formData.recurringDays.includes(index);
                  return (
                    <Button
                      key={day}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            recurringDays: formData.recurringDays.filter(d => d !== index)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            recurringDays: [...formData.recurringDays, index]
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      {day}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <Label>Time slots for each day</Label>
              <div className="grid grid-cols-4 gap-2 mt-2 max-h-48 overflow-y-auto">
                {timeSlots.map(time => {
                  const isSelected = formData.recurringTimes.includes(time);
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            recurringTimes: formData.recurringTimes.filter(t => t !== time)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            recurringTimes: [...formData.recurringTimes, time]
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Common fields */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="20">20 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
                <SelectItem value="90">90 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="treatmentType">Appointment Type</Label>
            <Select
              value={formData.treatmentType}
              onValueChange={(value) => setFormData({ ...formData, treatmentType: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine Check-up</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Preview Appointment Slots</h3>
        <p className="text-sm text-gray-600 mb-4">
          Review the {previewSlots.length} slot{previewSlots.length !== 1 ? 's' : ''} that will be created
        </p>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            These slots will be immediately available for patients to book
          </AlertDescription>
        </Alert>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {previewSlots.map((slot, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {format(new Date(slot.date), 'EEEE, MMM d')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {slot.time} ({slot.duration} min)
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {slot.treatmentType}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">Slots Created!</h3>
        <p className="text-gray-600">
          Successfully created {previewSlots.length} appointment slot{previewSlots.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3">What's next?</h4>
          <ul className="space-y-2 text-sm text-left">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Patients can now book these slots</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>You'll receive notifications for new bookings</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Review and approve bookings in your dashboard</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        <Button 
          onClick={() => {
            // Reset form
            setCurrentStep('mode');
            setPreviewSlots([]);
            setSelectedTemplate(null);
          }}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create More Slots
        </Button>
        
        <Button 
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Done
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'mode':
        return renderModeSelection();
      case 'details':
        return renderDetails();
      case 'preview':
        return renderPreview();
      case 'success':
        return renderSuccess();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'details':
        if (creationMode === 'single') {
          return formData.date && formData.time;
        } else if (creationMode === 'bulk') {
          return formData.bulkDates.length > 0 && formData.bulkTimes.length > 0;
        } else if (creationMode === 'recurring') {
          return formData.recurringDays.length > 0 && formData.recurringTimes.length > 0;
        }
        return false;
      case 'preview':
        return previewSlots.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'details':
        generatePreviewSlots();
        break;
      case 'preview':
        createSlotsMutation.mutate(previewSlots);
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'details':
        setCurrentStep('mode');
        break;
      case 'preview':
        setCurrentStep('details');
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Appointment Slots</span>
            {creationMode === 'recurring' && (
              <Badge className="bg-purple-100 text-purple-800">
                <Repeat className="h-3 w-3 mr-1" />
                Recurring
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {currentStep !== 'success' && currentStep !== 'mode' && (
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="min-h-[400px]">
          {renderCurrentStep()}
        </div>

        {currentStep !== 'success' && currentStep !== 'mode' && (
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={createSlotsMutation.isPending}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || createSlotsMutation.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {createSlotsMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : currentStep === 'preview' ? (
                <>
                  Create {previewSlots.length} Slot{previewSlots.length !== 1 ? 's' : ''}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}