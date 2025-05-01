"use client"

import { useState, useCallback, useEffect } from "react"
import { TabSystem, type LayoutNode } from "@/components/TabSystem"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useSearchParams, useRouter } from "next/navigation"
import { useExamState } from "../hooks/use-exam-state"
import { Brain, BookText, Headphones, MicVocal } from "lucide-react"
import { SessionController } from "../components/session/session-controller"

// This should match the icons available in TabSystem component
type IconType = "bookOpen" | "fileQuestion" | "bot" | "percent" | "hash";

export default function SessionPage() {
  const examState = useExamState();
  const [layout, setLayout] = useState<LayoutNode | null>(null);

  const getContentForTab = useCallback((tabId: string) => {
    if (!examState.levelConfig || !examState.moduleConfig) return null;

    switch (tabId) {
      case 'content':
        return (
          <div className="h-full p-4">
            <div className="prose dark:prose-invert max-w-none">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold">{examState.moduleConfig.label}</span>
                <span className="text-2xl font-bold text-muted-foreground">-</span>
                <span className="text-2xl font-bold">{examState.levelConfig.label}</span>
              </div>
              <p className="text-muted-foreground">{examState.levelConfig.details.description}</p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills Required</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {examState.levelConfig.details.skills.map((skill, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">{skill.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {skill.examples.map((example, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Text Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {examState.levelConfig.details.textTypes.map((type, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">{type.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {type.examples.map((example, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'questions':
        return (
          <div className="h-full p-4">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">Question Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examState.levelConfig.details.questionTypes.map((type, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">{type.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {type.examples.map((example, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 'results':
        return (
          <div className="h-full p-4">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">Exam Structure</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium mb-2">Overview</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Total Duration:</span>{" "}
                        <span className="font-medium">{examState.levelConfig.details.examStructure.totalDuration} minutes</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Total Questions:</span>{" "}
                        <span className="font-medium">{examState.levelConfig.details.examStructure.totalQuestions}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Passing Score:</span>{" "}
                        <span className="font-medium">{examState.levelConfig.details.examStructure.passingScore}%</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Difficulty:</span>{" "}
                        <span className="font-medium">{examState.levelConfig.details.examStructure.difficulty}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium mb-2">Preparation</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Recommended Time:</span>{" "}
                        <span className="font-medium">{examState.levelConfig.details.examStructure.preparationTime}</span>
                      </p>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Recommended Resources:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {examState.levelConfig.details.examStructure.recommendedResources.map((resource, index) => (
                            <li key={index} className="text-sm">{resource}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Exam Parts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {examState.levelConfig.details.examStructure.parts.map((part, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{part.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {part.duration} min
                            </span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {part.questions} q
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{part.description}</p>
                        <p className="text-sm text-muted-foreground mb-2">{part.format}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {part.skills.map((skill, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {part.tips.map((tip, i) => (
                            <p key={i} className="text-xs text-muted-foreground">• {tip}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'session-debug':
        return (
          <div className="h-full p-4 overflow-auto">
            <h2 className="text-xl font-bold mb-4">Session Debug</h2>
            <SessionController />
          </div>
        )
      default:
        return null
    }
  }, [examState.levelConfig, examState.moduleConfig]);

  const generateInitialLayout = useCallback((): LayoutNode => ({
    id: 'root_split',
    type: 'split',
    direction: 'horizontal',
    sizes: [70, 30],
    children: [
      {
        id: 'window_left',
        type: 'window',
        tabs: [
          { 
            id: 'content', 
            title: examState.moduleConfig?.label || 'Content', 
            iconType: getIconForModule(examState.moduleConfig?.id || '') 
          },
          {
            id: 'session-debug',
            title: 'Session Debug',
            iconType: 'hash'
          }
        ],
        activeTabId: 'content',
        isCollapsed: false,
      },
      {
        id: 'window_right',
        type: 'window',
        tabs: [
          { id: 'questions', title: 'Questions', iconType: 'fileQuestion' },
          { id: 'results', title: 'Results', iconType: 'percent' },
        ],
        activeTabId: 'questions',
        isCollapsed: false,
      }
    ],
  }), [examState.moduleConfig]);

  // Initialize layout
  if (!layout) {
    setLayout(generateInitialLayout());
  }

  if (!examState.levelConfig || !examState.moduleConfig) {
    return (
      <div className="h-[calc(100vh-4rem)] p-4 md:p-6 bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Invalid module or level selected</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <TabSystem
        layout={layout}
        onLayoutChange={setLayout}
        getContentForTab={getContentForTab}
      />
    </DndProvider>
  );
}

// Helper function to get the appropriate icon for each module
function getIconForModule(moduleId: string): IconType {
  switch (moduleId.toLowerCase()) {
    case 'reading':
      return 'bookOpen'
    case 'writing':
      return 'bookOpen'
    case 'listening':
      return 'bot'
    case 'speaking':
      return 'bot'
    default:
      return 'bookOpen'
  }
} 