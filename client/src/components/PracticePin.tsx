import { Practice } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PracticePinProps {
  practice: Practice;
  position: { top: string; left: string };
  onClick: (practice: Practice) => void;
}

export function PracticePin({ practice, position, onClick }: PracticePinProps) {
  const getColorByRating = (rating: number) => {
    if (rating >= 4.5) return "bg-green-500";
    if (rating >= 4.0) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div
      className="practice-pin absolute cursor-pointer"
      style={position}
      onClick={() => onClick(practice)}
    >
      <div className={cn(
        "w-12 h-12 rounded-full shadow-floating flex items-center justify-center border-4 border-white",
        getColorByRating(practice.rating || 0)
      )}>
        <i className="fas fa-tooth text-white text-sm"></i>
      </div>
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-gentle text-xs font-medium whitespace-nowrap">
        {practice.name}
      </div>
    </div>
  );
}
