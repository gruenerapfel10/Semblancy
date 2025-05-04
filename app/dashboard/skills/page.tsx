import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy } from "lucide-react"

export default function Skills() {
  const skills = [
    {
      name: "Algebra",
      category: "Mathematics",
      progress: 75,
      totalTopics: 12,
      completedTopics: 9,
      status: "In Progress"
    },
    {
      name: "Calculus",
      category: "Mathematics",
      progress: 30,
      totalTopics: 15,
      completedTopics: 4,
      status: "Started"
    },
    // Add more skills as needed
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Skills Tracker</h1>
          <p className="text-muted-foreground mt-2">Track your progress across different subjects</p>
        </div>
        <Button>
          Start New Skill
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{skill.name}</CardTitle>
                  <CardDescription>{skill.category}</CardDescription>
                </div>
                <Badge variant={skill.progress === 100 ? "default" : "secondary"}>
                  {skill.progress === 100 ? (
                    <Trophy className="h-4 w-4 mr-1" />
                  ) : null}
                  {skill.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={skill.progress} />
                <div className="text-sm text-muted-foreground">
                  {skill.completedTopics} of {skill.totalTopics} topics completed
                </div>
                <Button className="w-full" variant="outline">
                  Continue Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 