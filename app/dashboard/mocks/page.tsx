import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen } from "lucide-react"

export default function Mocks() {
  const mockExams = [
    {
      title: "Mathematics Mock 1",
      subject: "Mathematics",
      duration: "2 hours",
      questions: 50,
      difficulty: "Medium"
    },
    {
      title: "Physics Mock 1",
      subject: "Physics",
      duration: "1.5 hours",
      questions: 40,
      difficulty: "Hard"
    },
    // Add more mock exams as needed
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mock Exams</h1>
        <Button>Filter Mocks</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockExams.map((mock, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{mock.title}</CardTitle>
                <Badge>{mock.difficulty}</Badge>
              </div>
              <CardDescription>{mock.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{mock.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{mock.questions} questions</span>
                </div>
              </div>
              <Button className="w-full">Start Mock Exam</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 