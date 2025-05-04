import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      title: "Create Your Study Plan",
      description: "Customize your learning journey based on your goals and schedule"
    },
    {
      title: "Practice with Resources",
      description: "Access past papers, mock exams, and interactive study materials"
    },
    {
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics and insights"
    },
    {
      title: "Achieve Success",
      description: "Reach your academic goals with our comprehensive support"
    }
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">How It Works</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 