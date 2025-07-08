import { Practice, Appointment } from "@shared/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface PracticeBottomSheetProps {
  practice: Practice | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (appointment: Appointment) => void;
}

export function PracticeBottomSheet({ practice, isOpen, onClose, onBookAppointment }: PracticeBottomSheetProps) {
  const { data: appointments = [] } = useQuery({
    queryKey: [`/api/appointments/${practice?.id}`],
    enabled: !!practice,
  });

  if (!practice) return null;

  const accessibilityFeatures = [
    { key: "wheelchairAccess", label: "Wheelchair Access", icon: "fas fa-wheelchair" },
    { key: "signLanguage", label: "BSL Available", icon: "fas fa-sign-language" },
    { key: "visualSupport", label: "Visual Support", icon: "fas fa-eye" },
    { key: "cognitiveSupport", label: "Cognitive Support", icon: "fas fa-brain" },
    { key: "disabledParking", label: "Disabled Parking", icon: "fas fa-parking" },
  ];

  const availableFeatures = accessibilityFeatures.filter(feature => practice[feature.key as keyof Practice]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <SheetTitle className="text-left">{practice.name}</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {practice.imageUrl && (
            <img 
              src={practice.imageUrl} 
              alt={practice.name}
              className="w-full h-48 object-cover rounded-2xl shadow-soft"
            />
          )}
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star text-sm ${i < Math.floor(practice.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                  ))}
                </div>
                <span className="text-sm text-text-soft">({practice.rating})</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-text-soft">
              <i className="fas fa-map-marker-alt text-primary"></i>
              <span className="text-sm">{practice.address}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-text-soft">
              <i className="fas fa-clock text-primary"></i>
              <span className="text-sm">{practice.openingHours}</span>
            </div>
          </div>
          
          {availableFeatures.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary">Accessibility Features</h4>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map(feature => (
                  <Badge key={feature.key} variant="secondary" className="bg-primary/10 text-primary">
                    <i className={`${feature.icon} mr-1`}></i>
                    {feature.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h4 className="font-medium text-text-primary">Available Today</h4>
            <div className="grid grid-cols-2 gap-3">
              {appointments.map((appointment: Appointment) => (
                <Button
                  key={appointment.id}
                  variant="outline"
                  className="p-3 h-auto bg-green-50 hover:bg-green-100 border-green-200"
                  onClick={() => onBookAppointment(appointment)}
                >
                  <div className="text-center">
                    <div className="font-medium">{format(new Date(appointment.appointmentDate), 'h:mm a')}</div>
                    <div className="text-xs opacity-80">Available</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={onClose}>
              Select Time
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
