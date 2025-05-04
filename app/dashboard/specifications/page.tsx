import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

export default function Specifications() {
  const specifications = [
    {
      subject: "Mathematics",
      code: "9MA0",
      level: "A Level",
      sections: [
        {
          title: "Pure Mathematics 1",
          topics: ["Algebra and Functions", "Coordinate Geometry", "Sequences and Series"],
          resources: 3
        },
        {
          title: "Pure Mathematics 2",
          topics: ["Differentiation", "Integration", "Numerical Methods"],
          resources: 2
        },
      ]
    },
    {
      subject: "Physics",
      code: "9PH0",
      level: "A Level",
      sections: [
        {
          title: "Advanced Physics I",
          topics: ["Mechanics", "Electric Circuits", "Materials"],
          resources: 4
        },
      ]
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Exam Specifications</h1>

      <div className="grid gap-6">
        {specifications.map((spec, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{spec.subject}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{spec.code}</Badge>
                    <Badge>{spec.level}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Full Spec
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {spec.sections.map((section, sectionIndex) => (
                  <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        {section.title}
                        <Badge variant="secondary" className="ml-2">
                          {section.resources} resources
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                          {section.topics.map((topic, topicIndex) => (
                            <li key={topicIndex}>{topic}</li>
                          ))}
                        </ul>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download Resources
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 