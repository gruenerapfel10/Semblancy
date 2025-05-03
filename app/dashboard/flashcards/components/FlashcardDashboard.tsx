"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, List, BarChart, Brain, FlipHorizontal, FileText, Repeat, 
  Plus, Edit, Trash2, Play, Settings, Search, Keyboard, ArrowRight,
  BookOpen, Award, Clock, Calendar, Star, Filter, Zap, X
} from 'lucide-react';

import { cn } from "@/lib/utils";
import { useFlashcards } from './FlashcardContext';
import FlashcardList from './FlashcardList';
import { useHotkeys } from 'react-hotkeys-hook';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getLibraryRetention } from '../utils/forgettingCurve';

const FlashcardDashboard: React.FC = () => {
  const {
    selectedLibrary,
    libraryStudySessions,
    activeTab,
    setActiveTab,
    openLibraryDialog,
    openCardDialog,
    openDeleteDialog,
    startStudyMode,
  } = useFlashcards();

  // Local state
  const [studyMode, setStudyMode] = useState<'flip' | 'interactive'>('flip');
  const [sessionType, setSessionType] = useState<'infinite' | 'fixed'>('infinite');
  const [reps, setReps] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);
  const [lastStudyDate, setLastStudyDate] = useState<Date | null>(null);
  const [streakDays, setStreakDays] = useState(0);

  // Calculate study streak and last study date
  useEffect(() => {
    if (libraryStudySessions.length > 0) {
      const sortedSessions = [...libraryStudySessions].sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      setLastStudyDate(new Date(sortedSessions[0].startTime));
      
      // Simple streak calculation
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dates = sortedSessions.map(session => {
        const date = new Date(session.startTime);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });
      
      const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const compareDate = new Date(today);
        compareDate.setDate(today.getDate() - i);
        
        if (uniqueDates.includes(compareDate.getTime())) {
          streak++;
        } else {
          break;
        }
      }
      
      setStreakDays(streak);
    }
  }, [libraryStudySessions]);

  // Calculate metrics if there are study sessions
  const calculateMetrics = () => {
    if (libraryStudySessions.length === 0) return null;
    
    const totalCards = selectedLibrary?.cards.length || 0;
    const totalSessions = libraryStudySessions.length;
    const bestScore = Math.max(...libraryStudySessions.map(s => s.score));
    const avgScore = Math.round(
      libraryStudySessions.reduce((sum, s) => sum + s.score, 0) / totalSessions
    );
    const totalCardsStudied = libraryStudySessions.reduce((sum, s) => sum + s.total, 0);
    
    return { totalCards, totalSessions, bestScore, avgScore, totalCardsStudied };
  };

  const metrics = calculateMetrics();

  // Register keyboard shortcuts
  useHotkeys('ctrl+n', () => openCardDialog(null), { enableOnFormTags: true });
  useHotkeys('ctrl+e', () => selectedLibrary && openLibraryDialog(selectedLibrary), { enableOnFormTags: true });
  useHotkeys('ctrl+s', () => startStudyMode(studyMode, sessionType, sessionType === 'fixed' ? reps : 0), { enableOnFormTags: true });
  useHotkeys('shift+/', () => setShowShortcutsDialog(true), { enableOnFormTags: true });
  useHotkeys('1', () => setActiveTab('cards'), { enableOnFormTags: true });
  useHotkeys('2', () => setActiveTab('stats'), { enableOnFormTags: true });
  useHotkeys('3', () => setActiveTab('study'), { enableOnFormTags: true });

  // Empty state if no library is selected
  if (!selectedLibrary) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full items-center justify-center"
      >
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Flashcards</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-primary/60 mb-4" />
            <p className="text-muted-foreground mb-6">
              Select a library from the sidebar or create a new one to get started.
            </p>
            <Button 
              size="lg" 
              onClick={() => openLibraryDialog(null)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Library
            </Button>
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            <Keyboard className="h-4 w-4 mr-1" /> Press Shift+/ for keyboard shortcuts
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{selectedLibrary.name}</h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => openLibraryDialog(selectedLibrary)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Library (Ctrl+E)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {selectedLibrary.cards.length > 0 && (
                <Badge variant="outline" className="ml-1">
                  {selectedLibrary.cards.length} cards
                </Badge>
              )}
            </div>
            {selectedLibrary.description && (
              <p className="text-muted-foreground text-sm mt-1">{selectedLibrary.description}</p>
            )}
          </div>
          
          <div className="flex gap-2 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9"
                    onClick={() => setShowShortcutsDialog(true)}
                  >
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard Shortcuts (Shift+/)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Settings className="h-4 w-4 mr-1" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Library Actions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openLibraryDialog(selectedLibrary)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Library
                  <DropdownMenuShortcut>Ctrl+E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openCardDialog(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                  <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => openDeleteDialog('library', selectedLibrary)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Library
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {selectedLibrary.cards.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      className="gap-1"
                      onClick={() => startStudyMode(studyMode, sessionType, sessionType === 'fixed' ? reps : 0)}
                    >
                      <Play className="h-4 w-4" />
                      Study
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start Study Session (Ctrl+S)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <Separator className="mb-4" />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Optional Welcome Card - can be dismissed */}
          <AnimatePresence>
            {showWelcomeCard && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Card className="bg-muted/40 border-dashed shadow-none">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-amber-500 mr-2" />
                      <span>
                        {streakDays > 0 ? (
                          <span><strong>{streakDays} day streak!</strong> Keep it up for better retention.</span>
                        ) : (
                          <span>Start a study session today to build your streak!</span>
                        )}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6" 
                      onClick={() => setShowWelcomeCard(false)}
                    >
                      Dismiss
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs for Cards, Stats, Study */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center mb-4">
              <TabsList className="h-9">
                <TabsTrigger value="cards" className="flex items-center gap-1 px-3">
                  <List className="h-4 w-4" />
                  <span>Cards</span>
                  <kbd className="ml-1 text-[10px] text-muted-foreground">1</kbd>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-1 px-3">
                  <BarChart className="h-4 w-4" />
                  <span>Stats</span>
                  <kbd className="ml-1 text-[10px] text-muted-foreground">2</kbd>
                </TabsTrigger>
                <TabsTrigger value="study" className="flex items-center gap-1 px-3">
                  <Brain className="h-4 w-4" />
                  <span>Study</span>
                  <kbd className="ml-1 text-[10px] text-muted-foreground">3</kbd>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="cards" className="mt-0 space-y-4">
              <FlashcardList
                library={selectedLibrary}
                onEdit={(card) => openCardDialog(card)}
                onDelete={(card) => openDeleteDialog('card', card)}
                onAdd={() => openCardDialog(null)}
                searchQuery={searchQuery}
              />
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              {metrics ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                          <div className="text-3xl font-bold">{metrics.bestScore}%</div>
                          <div className="text-xs text-muted-foreground mt-1">Best Score</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Award className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                          <div className="text-3xl font-bold">{metrics.avgScore}%</div>
                          <div className="text-xs text-muted-foreground mt-1">Average Score</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Book className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <div className="text-3xl font-bold">{metrics.totalCardsStudied}</div>
                          <div className="text-xs text-muted-foreground mt-1">Cards Studied</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                          <div className="text-3xl font-bold">{metrics.totalSessions}</div>
                          <div className="text-xs text-muted-foreground mt-1">Study Sessions</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary/80" />
                        Memory Retention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-8 w-1 bg-amber-500/50 rounded"></div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-amber-500">Critical (0-40% retention)</h4>
                            <p className="text-xs text-muted-foreground">
                              Memory has significantly decayed. Review immediately.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-8 w-1 bg-blue-500/40 rounded"></div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-blue-500">High Priority (40-60% retention)</h4>
                            <p className="text-xs text-muted-foreground">
                              Memory is decaying rapidly. Review very soon.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-8 w-1 bg-emerald-500/30 rounded"></div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-emerald-500">Medium Priority (60-80% retention)</h4>
                            <p className="text-xs text-muted-foreground">
                              Memory is beginning to fade. Review recommended.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="h-8 w-1 bg-slate-400/25 rounded"></div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-400">Low Priority (80-90% retention)</h4>
                            <p className="text-xs text-muted-foreground">
                              Memory still relatively strong. Review when convenient.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">About Forgetting Curve</h4>
                        <p className="text-xs text-muted-foreground">
                          Based on Hermann Ebbinghaus&apos; research, our algorithm calculates memory retention using the exponential forgetting curve formula: R = e^(-t/S), where R is retention, t is time since last review, and S is memory strength (which increases with repetition and performance).
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Libraries that need review are indicated with colored borders in the sidebar, making it easy to identify which content needs your attention while maintaining a clean interface.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>Recent Sessions</span>
                        {lastStudyDate && (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center text-sm font-normal text-muted-foreground cursor-help">
                                <Clock className="h-3 w-3 mr-1" />
                                Last studied {timeAgo(lastStudyDate)}
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="flex justify-between space-x-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">Study Streak</h4>
                                  <div className="flex items-center">
                                    <Zap className="h-4 w-4 text-amber-500 mr-1" />
                                    <span className="text-sm">{streakDays} days</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Study daily to improve your retention and build your streak.
                                  </p>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {libraryStudySessions
                          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                          .slice(0, 5)
                          .map(session => (
                            <div key={session.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                              <div>
                                <div className="text-sm font-medium flex items-center">
                                  {new Date(session.startTime).toLocaleDateString()} 
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {session.studyMode === 'flip' ? 'Flip Cards' : 'Interactive'}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {session.correct} correct out of {session.total}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span className="text-lg font-bold mr-2">{session.score}%</span>
                                <Progress
                                  value={session.score}
                                  className="h-2 w-16"
                                  style={{
                                    backgroundColor: 'hsl(var(--muted))',
                                    '--progress-foreground': session.score >= 80 
                                      ? 'hsl(var(--success))' 
                                      : session.score >= 60 
                                        ? 'hsl(var(--warning))' 
                                        : 'hsl(var(--destructive))',
                                  } as React.CSSProperties}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 flex flex-col items-center justify-center">
                    <BarChart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Study Data Yet</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                      Start studying to track your progress and see your statistics here.
                    </p>
                    <Button 
                      onClick={() => startStudyMode(studyMode, sessionType, sessionType === 'fixed' ? reps : 0)}
                      className="gap-1"
                    >
                      <Play className="h-4 w-4" />
                      Start First Session
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="study" className="mt-0">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary/80" />
                    Study Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-4">
                    <Book className="h-16 w-16 text-primary/60 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Ready to study?</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Test your knowledge with flashcards from this library. Choose your preferred study mode below.
                    </p>
                    
                    {/* Study Options Panel */}
                    <div className="w-full max-w-2xl p-4 bg-muted/30 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <div className="font-medium mb-2 flex items-center gap-1">
                            <FlipHorizontal className="h-4 w-4" />
                            <span>Study Mode</span>
                          </div>
                          <Select value={studyMode} onValueChange={(v) => setStudyMode(v as 'flip' | 'interactive')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flip">
                                <div className="flex items-center">
                                  <FlipHorizontal className="h-4 w-4 mr-2" />
                                  <span>Flip Cards</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="interactive">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  <span>Interactive</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <div className="font-medium mb-2 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Session Type</span>
                          </div>
                          <Select value={sessionType} onValueChange={(v) => setSessionType(v as 'infinite' | 'fixed')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="infinite">Infinite</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {sessionType === 'fixed' && (
                          <div>
                            <div className="font-medium mb-2 flex items-center gap-1">
                              <Repeat className="h-4 w-4" />
                              <span>Repetitions</span>
                            </div>
                            <Select 
                              value={reps.toString()} 
                              onValueChange={(v) => setReps(parseInt(v))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 5, 10, 15, 20].map(num => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} {num === 1 ? 'time' : 'times'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-center pb-6">
                  <Button 
                    size="lg"
                    onClick={() => startStudyMode(studyMode, sessionType, sessionType === 'fixed' ? reps : 0)}
                    className="gap-2 min-w-[200px]"
                    disabled={selectedLibrary.cards.length === 0}
                  >
                    <Play className="h-4 w-4" />
                    Start Studying
                    <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
                  </Button>
                  {selectedLibrary.cards.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Add some cards first to start studying
                    </p>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate and perform actions quickly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Create new card</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+N</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Edit library</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+E</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Start studying</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">View shortcuts</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift+/</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cards tab</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">1</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stats tab</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">2</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Study tab</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">3</kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper function to format dates as "X time ago"
function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default FlashcardDashboard; 