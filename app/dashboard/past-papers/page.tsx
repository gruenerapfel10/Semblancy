"use client"
import { useState } from "react"
import { FileUpload } from "@/components/ui/file-upload"
import { Search, Download, FileText, UploadCloud, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import PdfViewer from "@/components/pdf-viewer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  UploadedPaper, 
  usePastPapers, 
  PaperFilter 
} from "@/lib/past-papers"

export default function PastPapers() {
  // Use the custom hook that manages papers with localStorage
  const { 
    papers, 
    isLoading, 
    addPapers, 
    deletePaper, 
    clearAllPapers, 
    getPapers, 
    getFieldValues
  } = usePastPapers();

  // State for UI management
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedPaper, setSelectedPaper] = useState<UploadedPaper | undefined>()
  const [showUploadUI, setShowUploadUI] = useState(false)

  // Handle uploading new papers
  const handleUpload = async (files: File[]) => {
    const newPapers = await addPapers(files);
    
    if (newPapers.length > 0 && !selectedPaper) {
      setSelectedPaper(newPapers[0]);
    }
    
    setShowUploadUI(false);
  };

  // Handle downloading papers
  const handleDownload = (paper: UploadedPaper) => {
    const url = URL.createObjectURL(paper.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = paper.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle deleting papers
  const handleDeletePaper = (paperToDelete: UploadedPaper) => {
    if (selectedPaper && selectedPaper.id === paperToDelete.id) {
      const remainingPapers = papers.filter(p => p.id !== paperToDelete.id);
      setSelectedPaper(remainingPapers.length > 0 ? remainingPapers[0] : undefined);
    }
    deletePaper(paperToDelete);
  };

  // Apply filters to papers
  const filteredPapers = getPapers({
    searchTerm,
    subject: selectedSubject === "all" ? undefined : selectedSubject,
    year: selectedYear === "all" ? undefined : selectedYear
  });

  // Get unique values for filters
  const subjects = getFieldValues('subject');
  const years = getFieldValues('year');

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-2/5 border-r p-4 h-full overflow-hidden flex flex-col">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Past Papers</h1>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setShowUploadUI(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <UploadCloud className="h-4 w-4" />
                      Upload
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload new papers</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => {
                        if (confirm("Are you sure you want to delete all papers?")) {
                          clearAllPapers();
                          setSelectedPaper(undefined);
                        }
                      }}
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear all papers</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {showUploadUI && (
            <div className="mb-4 border p-4 rounded-lg bg-muted/20">
              <h2 className="text-sm font-medium mb-2">Upload Papers</h2>
              <FileUpload onChange={handleUpload} />
            </div>
          )}
          
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Paper</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPapers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No papers found. Upload some papers to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPapers.map((paper) => (
                        <TableRow 
                          key={paper.id} 
                          className={`${selectedPaper?.id === paper.id ? 'bg-primary/5' : ''} cursor-pointer`}
                          onClick={() => setSelectedPaper(paper)}
                        >
                          <TableCell>{paper.year}</TableCell>
                          <TableCell>{paper.subject}</TableCell>
                          <TableCell>{paper.paper}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(paper);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePaper(paper);
                              }}
                            >
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="w-3/5 h-full">
        {selectedPaper ? (
          <PdfViewer file={selectedPaper.file} />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/20">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a paper to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 