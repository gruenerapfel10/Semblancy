"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  Trophy, 
  Clock, 
  TrendingUp,
  Calendar
} from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Student</h1>
          <p className="text-muted-foreground">
            Track your progress and continue your language exam preparation
          </p>
        </div>
        <Button>Start New Session</Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5</div>
            <p className="text-xs text-muted-foreground">
              +2.5 hours from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mock Tests Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5</div>
            <p className="text-xs text-muted-foreground">
              +0.5 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Exam</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 days</div>
            <p className="text-xs text-muted-foreground">
              IELTS Academic
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Progress</CardTitle>
          <CardDescription>Your current progress in each skill area</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Reading</span>
              </div>
              <Badge variant="secondary">7.5/9</Badge>
            </div>
            <Progress value={83} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Headphones className="h-4 w-4" />
                <span>Listening</span>
              </div>
              <Badge variant="secondary">8.0/9</Badge>
            </div>
            <Progress value={89} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PenTool className="h-4 w-4" />
                <span>Writing</span>
              </div>
              <Badge variant="secondary">6.5/9</Badge>
            </div>
            <Progress value={72} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <span>Speaking</span>
              </div>
              <Badge variant="secondary">7.0/9</Badge>
            </div>
            <Progress value={78} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity and Upcoming Sessions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest study sessions and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Completed Mock Test #{i}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score: 7.5/9
                      </p>
                    </div>
                    <Badge variant="secondary">2 days ago</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {i === 1 ? "Speaking Practice" : 
                         i === 2 ? "Writing Workshop" :
                         i === 3 ? "Reading Comprehension" :
                         i === 4 ? "Listening Exercise" :
                         "Mock Test"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {i === 1 ? "With native speaker" :
                         i === 2 ? "Essay writing practice" :
                         i === 3 ? "Academic texts" :
                         i === 4 ? "Academic lectures" :
                         "Full length test"}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {i === 1 ? "Today" :
                       i === 2 ? "Tomorrow" :
                       i === 3 ? "In 2 days" :
                       i === 4 ? "In 3 days" :
                       "In 4 days"}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 