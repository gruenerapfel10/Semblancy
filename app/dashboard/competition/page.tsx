import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, BookOpen, HelpCircle } from "lucide-react"

export default function Competition() {
  const categories = [
    {
      title: "General Discussion",
      description: "Connect with other students and discuss general topics",
      icon: MessageCircle
    },
    {
      title: "Study Groups",
      description: "Find or create study groups for collaborative learning",
      icon: Users  
    },
    {
      title: "Subject Help",
      description: "Get help with specific subjects from peers and tutors",
      icon: BookOpen
    },
    {
      title: "Q&A",
      description: "Ask questions and share your knowledge with the community",
      icon: HelpCircle
    }
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Forums</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <category.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}