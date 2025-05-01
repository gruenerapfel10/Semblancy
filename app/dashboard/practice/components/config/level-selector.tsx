import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface LevelSelectorProps {
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  availableLevels: Array<{ id: string; label: string }>;
}

export function LevelSelector({ 
  selectedLevel, 
  setSelectedLevel, 
  availableLevels 
}: LevelSelectorProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-3 gap-2 flex-1">
        {availableLevels.map(({ id, label }) => (
          <Button
            key={id}
            variant={selectedLevel === id ? "default" : "outline"}
            className={cn(
              "h-full flex flex-col items-center justify-center relative",
              selectedLevel === id && "border-primary"
            )}
            onClick={() => setSelectedLevel(id)}
          >
            <span className="text-xs font-medium">{id.toUpperCase()}</span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
            {selectedLevel === id && (
              <ChevronRight className="absolute right-2 h-4 w-4 text-primary" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
} 