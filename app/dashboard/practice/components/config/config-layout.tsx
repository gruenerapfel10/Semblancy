import { useMediaQuery } from "@/app/hooks/use-media-query";
import { ConfigSelector } from "./config-selector";
import { LevelDetails } from "./level-details";
import { ExamSummary } from "./exam-summary";
import { ModuleConfig, LevelConfig, ExamTypeConfig } from "@/lib/exam";

interface ConfigLayoutProps {
  selectedModule: string;
  setSelectedModule: (module: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  moduleConfig: ModuleConfig | null;
  levelConfig: LevelConfig | null;
  examTypeConfig: ExamTypeConfig | null;
  availableModules: Array<{ id: string; label: string; icon: any }>;
  availableLevels: Array<{ id: string; label: string }>;
  onStart: () => void;
}

export function ConfigLayout({ 
  selectedModule,
  setSelectedModule,
  selectedLevel,
  setSelectedLevel,
  moduleConfig,
  levelConfig,
  examTypeConfig,
  availableModules,
  availableLevels,
  onStart
}: ConfigLayoutProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!moduleConfig || !examTypeConfig || !levelConfig) return null;

  return (
    <div className="h-[calc(100vh-8rem)] p-4">
      <div className={`grid gap-4 h-full ${
        isDesktop 
          ? "grid-cols-[1fr_1fr] grid-rows-1" 
          : "grid-cols-1 grid-rows-[auto_auto]"
      }`}>
        <div className={isDesktop ? "grid grid-rows-[auto_1fr] gap-4" : "space-y-4"}>
          <div className="shrink-0">
            <ConfigSelector 
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              availableModules={availableModules}
              availableLevels={availableLevels}
            />
          </div>
          <div className="min-h-0">
            <LevelDetails levelConfig={levelConfig} />
          </div>
        </div>
        <div className="h-full">
          <ExamSummary 
            moduleConfig={moduleConfig}
            levelConfig={levelConfig}
            examType={examTypeConfig.id}
            onStart={onStart}
          />
        </div>
      </div>
    </div>
  );
} 