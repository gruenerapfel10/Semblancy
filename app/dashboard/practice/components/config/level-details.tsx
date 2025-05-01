import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, BookOpen, FileQuestion, Brain, Target, Timer, BookMarked } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface LevelDetailsProps {
  levelConfig: {
    label: string;
    details: {
      description: string;
      skills: Array<{
        name: string;
        description: string;
        examples: string[];
      }>;
      textTypes: Array<{
        name: string;
        description: string;
        examples: string[];
      }>;
      questionTypes: Array<{
        name: string;
        description: string;
        examples: string[];
      }>;
      examStructure: {
        description: string;
        parts: Array<{
          name: string;
          description: string;
          duration: number;
          questions: number;
          skills: string[];
          format: string;
          tips: string[];
        }>;
        totalDuration: number;
        totalQuestions: number;
        passingScore: number;
        difficulty: 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced' | 'proficiency';
        preparationTime: string;
        recommendedResources: string[];
      };
    };
  };
}

export function LevelDetails({ levelConfig }: LevelDetailsProps) {
  const { label, details } = levelConfig;

  return (
    <Card className="h-full flex flex-col bg-muted/50">
      <CardHeader className="p-4 pb-2 shrink-0">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{label}</span>
            <Badge variant="secondary" className="text-xs">
              {details.examStructure.totalDuration} min
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {details.examStructure.totalQuestions} questions
            </Badge>
            <Badge variant="outline" className="text-xs">
              {details.examStructure.passingScore}% pass
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="w-full h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 shrink-0">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="structure" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Structure
            </TabsTrigger>
            <TabsTrigger value="preparation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Preparation
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-1">
            <div className="h-full">
              <TabsContent value="overview" className="p-4 space-y-4 h-full">
                <p className="text-sm text-muted-foreground">{details.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="skills">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          <span>Skills</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {details.skills.map((skill, index) => (
                          <div key={index} className="mb-3 last:mb-0">
                            <p className="text-sm font-medium mb-1">{skill.name}</p>
                            <p className="text-xs text-muted-foreground mb-2">{skill.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {skill.examples.map((example, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{example}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="text-types">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Text Types</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {details.textTypes.map((type, index) => (
                          <div key={index} className="mb-3 last:mb-0">
                            <p className="text-sm font-medium mb-1">{type.name}</p>
                            <p className="text-xs text-muted-foreground mb-2">{type.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {type.examples.map((example, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{example}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <Accordion type="single" collapsible>
                  <AccordionItem value="question-types">
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <FileQuestion className="h-4 w-4" />
                        <span>Question Types</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {details.questionTypes.map((type, index) => (
                        <div key={index} className="mb-3 last:mb-0">
                          <p className="text-sm font-medium mb-1">{type.name}</p>
                          <p className="text-xs text-muted-foreground mb-2">{type.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {type.examples.map((example, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{example}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="structure" className="p-4 space-y-4 h-full">
                <p className="text-sm text-muted-foreground">{details.examStructure.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {details.examStructure.parts.map((part, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{part.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{part.duration} min</Badge>
                          <Badge variant="outline" className="text-xs">{part.questions} q</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{part.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {part.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{part.format}</p>
                      <div className="space-y-1">
                        {part.tips.map((tip, i) => (
                          <p key={i} className="text-xs text-muted-foreground">• {tip}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="preparation" className="p-4 space-y-4 h-full">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Target className="h-4 w-4" />
                      <span>Difficulty Level</span>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {details.examStructure.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Timer className="h-4 w-4" />
                      <span>Preparation Time</span>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {details.examStructure.preparationTime}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <BookMarked className="h-4 w-4" />
                    <span>Recommended Resources</span>
                  </div>
                  <div className="space-y-1">
                    {details.examStructure.recommendedResources.map((resource, index) => (
                      <p key={index} className="text-sm flex items-center gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{resource}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
