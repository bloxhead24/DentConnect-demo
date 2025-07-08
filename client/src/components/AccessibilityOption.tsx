import { AccessibilityNeed } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AccessibilityOptionProps {
  need: AccessibilityNeed;
  selected: boolean;
  onToggle: (need: AccessibilityNeed) => void;
}

export function AccessibilityOption({ need, selected, onToggle }: AccessibilityOptionProps) {
  return (
    <Card
      className={cn(
        "accessibility-option p-4 cursor-pointer border-2 transition-all duration-200",
        selected ? "border-primary bg-primary/5" : "border-transparent hover:bg-primary/5"
      )}
      onClick={() => onToggle(need)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <i className={`${need.icon} text-primary text-sm`}></i>
        </div>
        <div>
          <h4 className="font-medium text-text-primary">{need.name}</h4>
          <p className="text-xs text-text-soft">{need.description}</p>
        </div>
      </div>
    </Card>
  );
}
