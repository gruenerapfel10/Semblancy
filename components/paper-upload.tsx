"use client"
import { useState } from "react"
import { FileUpload } from "@/components/ui/file-upload"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, X } from "lucide-react"

export interface UploadedPaper {
  file: File;
  year: string;
  subject: string;
  paper: string;
  type: string;
  season: string;
}

interface FileUploadDemoProps {
  onUpload: (papers: UploadedPaper[]) => void;
  papers: UploadedPaper[];
  onSelectPaper: (paper: UploadedPaper) => void;
  onDeletePaper: (paper: UploadedPaper) => void;
  selectedPaper?: UploadedPaper;
}

export default function FileUploadDemo({ 
  onUpload, 
  papers, 
  onSelectPaper, 
  onDeletePaper,
  selectedPaper 
}: FileUploadDemoProps) {
  const handleFileUpload = (files: File[]) => {
    // Convert Files to UploadedPaper format
    const newPapers: UploadedPaper[] = files.map(file => {
      // Extract metadata from filename (you can enhance this logic)
      const name = file.name.replace('.pdf', '').split('_');
      return {
        file,
        year: name[0] || '2024',
        subject: name[1] || 'Mathematics',
        paper: name[2] || 'Paper 1',
        type: name[3] || 'Question Paper',
        season: name[4] || 'Summer'
      };
    });
    
    onUpload(newPapers);
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {papers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No papers uploaded yet
            </div>
          ) : (
            papers.map((paper, index) => (
              <Card 
                key={index} 
                className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${selectedPaper?.file.name === paper.file.name ? 'bg-primary/10 border-primary/50' : ''}`}
                onClick={() => onSelectPaper(paper)}
              >
                <div className="truncate">
                  <div className="font-medium">{paper.subject} - {paper.paper}</div>
                  <div className="text-xs text-muted-foreground">{paper.year} {paper.season}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePaper(paper);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="mb-2">
        <div className="w-full border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
          <FileUpload onChange={handleFileUpload} />
        </div>
      </div>
    </div>
  )
}
