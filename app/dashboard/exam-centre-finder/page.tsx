import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function ExamCentreFinder() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Exam Centre Finder</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find an Exam Centre Near You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input 
              placeholder="Enter your postcode or city" 
              className="max-w-md"
            />
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Map will be displayed here</p>
      </div>
    </div>
  )
} 