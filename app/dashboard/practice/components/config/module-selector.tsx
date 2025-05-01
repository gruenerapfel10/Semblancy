import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface ModuleSelectorProps {
  selectedModule: string;
  setSelectedModule: (module: string) => void;
  availableModules: Array<{ id: string; label: string; icon: any }>;
}

export function ModuleSelector({ 
  selectedModule, 
  setSelectedModule, 
  availableModules 
}: ModuleSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Module</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableModules.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant={selectedModule === id ? "default" : "outline"}
            className={cn(
              "h-12 flex items-center gap-2 px-3 relative",
              selectedModule === id && "border-primary"
            )}
            onClick={() => setSelectedModule(id)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-xs">{label}</span>
            {selectedModule === id && (
              <ChevronRight className="absolute right-2 h-4 w-4 text-primary" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
} 