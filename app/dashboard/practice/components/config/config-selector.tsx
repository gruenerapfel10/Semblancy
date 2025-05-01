import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ModuleSelector } from "./module-selector";
import { LevelSelector } from "./level-selector";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target } from "lucide-react";

interface Module {
  id: string;
  label: string;
  icon: any;
  skills?: string[];
}

interface Level {
  id: string;
  label: string;
  difficulty?: string;
  duration?: string;
}

interface ConfigSelectorProps {
  selectedModule: string;
  setSelectedModule: (module: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  availableModules: Module[];
  availableLevels: Level[];
}

export function ConfigSelector({ 
  selectedModule, 
  setSelectedModule, 
  selectedLevel, 
  setSelectedLevel, 
  availableModules, 
  availableLevels 
}: ConfigSelectorProps) {
  // Handle module selection with validation
  const handleModuleChange = (moduleId: string) => {
    // Validate if the module exists
    const moduleExists = availableModules.some(m => m.id === moduleId);
    if (!moduleExists) return;

    setSelectedModule(moduleId);

    // If current level is not available for new module, reset to first available level
    const firstAvailableLevel = availableLevels[0]?.id;
    if (firstAvailableLevel && firstAvailableLevel !== selectedLevel) {
      setSelectedLevel(firstAvailableLevel);
    }
  };

  // Handle level selection with validation
  const handleLevelChange = (levelId: string) => {
    // Validate if the level exists
    const levelExists = availableLevels.some(l => l.id === levelId);
    if (!levelExists) return;

    setSelectedLevel(levelId);
  };

  return (
    <Card className="h-full flex flex-col bg-muted/50">
      <CardHeader className="p-4 pb-2 shrink-0">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Configure Practice</span>
            <Badge variant="secondary" className="text-xs">
              {availableModules.length} modules
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            {availableLevels.length} levels
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">Select your module and level to start practicing</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <BookOpen className="h-4 w-4" />
            <span>Module</span>
          </div>
          <ModuleSelector 
            selectedModule={selectedModule}
            setSelectedModule={handleModuleChange}
            availableModules={availableModules}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Target className="h-4 w-4" />
            <span>Level</span>
          </div>
          <LevelSelector 
            selectedLevel={selectedLevel}
            setSelectedLevel={handleLevelChange}
            availableLevels={availableLevels}
          />
        </div>
      </CardContent>
    </Card>
  );
} 