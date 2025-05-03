import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Flashcard } from './types';
import { 
  Plus, FileText, Image, Upload, Download, 
  Keyboard, ShieldCheck, Copy, Edit, Trash2,
  CheckCircle2, ArrowDownUp, Book, X
} from 'lucide-react';
import DialogWrapper from './ui/DialogWrapper';
import type { Attachment } from 'ai';
import { PreviewAttachment } from '@/components/preview-attachment';

// Types
interface FlashcardCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: Flashcard | null;
  onSave: (card: Partial<Flashcard>) => void;
  libraryId: string;
}

interface BatchCard {
  id: string;
  front: string;
  back: string;
  isValid: boolean;
}

// Modular Components
const KeyboardShortcutsTooltip = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
          <Keyboard className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-96">
        <div className="space-y-1">
          <h4 className="font-semibold">Keyboard Shortcuts</h4>
          <ul className="text-xs space-y-1">
            <li>• <span className="font-mono bg-muted px-1 rounded">Tab</span>: Move to next field</li>
            <li>• <span className="font-mono bg-muted px-1 rounded">Shift+Tab</span>: Move to previous field</li>
            <li>• <span className="font-mono bg-muted px-1 rounded">Enter</span>: Add new card</li>
            <li>• <span className="font-mono bg-muted px-1 rounded">Shift+Enter</span>: Multiline in current field</li>
            <li>• <span className="font-mono bg-muted px-1 rounded">Alt+D</span>: Delete current card</li>
          </ul>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Import Dialog
const ImportDialog = ({
  open, 
  onOpenChange,
  onImport
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (cards: BatchCard[]) => void;
}) => {
  const [importText, setImportText] = useState<string>('');
  const [importSeparator, setImportSeparator] = useState<string>('\t');
  const [importPreview, setImportPreview] = useState<BatchCard[]>([]);
  const [importMethod, setImportMethod] = useState<'text' | 'file'>('text');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setImportText('');
      setImportPreview([]);
      setAttachments([]);
      setUploadQueue([]);
      setImportMethod('text');
      setIsProcessing(false);
    }
  }, [open]);

  const handleImportPreview = () => {
    if (!importText.trim()) return;
    
    try {
      const lines = importText.trim().split('\n');
      const cards: BatchCard[] = [];
      
      for (const line of lines) {
        const [front, back] = line.split(importSeparator);
        if (front && back) {
          cards.push({
            id: generateId(),
            front: front.trim(),
            back: back.trim(),
            isValid: true
          });
        }
      }
      
      setImportPreview(cards);
    } catch (error) {
      toast.error("Import failed", {
        description: "Could not parse the text. Please check the format."
      });
    }
  };

  const uploadFile = async (file: File): Promise<Attachment | undefined> => {
    console.log("Uploading file:", file.name, file.type, file.size);
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log("Sending upload request to /api/files/upload");
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log("Upload response status:", response.status, "Response data:", data);
      
      if (response.ok) {
        console.log("Upload successful, response data:", data);
        const { url, pathname, contentType } = data;

        // Create a valid attachment object
        return {
          url: url || '',
          name: pathname || file.name,
          contentType: contentType || file.type,
        };
      } else {
        // Log and display the error from the server
        console.error("Upload failed with status:", response.status);
        console.error("Error details:", data.error);
        
        // Handle specific errors with more detailed messages
        if (data.error?.includes('bucket not found')) {
          toast.error("Storage bucket not found", {
            description: "The storage bucket doesn't exist. Please check your Supabase configuration."
          });
        } else if (data.error?.includes('bucket check failed')) {
          toast.error("Bucket configuration error", {
            description: data.error || "Storage system is not properly configured."
          });
        } else if (data.error?.includes('permission')) {
          toast.error("Permission denied", {
            description: `You don't have permission to upload to this location. Error: ${data.error}`
          });
        } else {
          // Show the full error message for debugging
          toast.error(`Upload failed: ${data.error}`, {
            description: "Check console for more details."
          });
        }
        
        return undefined;
      }
    } catch (error) {
      console.error('Network error in uploadFile:', error);
      toast.error('Connection error during upload', {
        description: 'Could not connect to the server. Please check your network connection.'
      });
      return undefined;
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    console.log("Files selected:", files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    setUploadQueue(files.map((file) => file.name));

    try {
      const uploadPromises = files.map((file) => uploadFile(file));
      const uploadedAttachments = await Promise.all(uploadPromises);
      console.log("Upload responses:", uploadedAttachments);

      const successfullyUploadedAttachments = uploadedAttachments.filter(
        (attachment) => attachment !== undefined,
      ) as Attachment[];
      
      console.log("Successfully uploaded attachments:", successfullyUploadedAttachments);

      setAttachments((currentAttachments) => {
        const newAttachments = [...currentAttachments, ...successfullyUploadedAttachments];
        console.log("Updated attachments state:", newAttachments);
        return newAttachments;
      });

      // Process PDF files for card extraction
      const pdfAttachments = successfullyUploadedAttachments.filter(
        att => att.contentType === 'application/pdf'
      );
      
      console.log("PDF attachments:", pdfAttachments);
      
      if (pdfAttachments.length > 0) {
        toast.info("PDF detected. Processing file for flashcards...");
        processPdfForFlashcards(pdfAttachments[0]);
      } else if (successfullyUploadedAttachments.length > 0) {
        toast.success("File uploaded successfully", {
          description: "Click 'Process File' to extract flashcards"
        });
      } else {
        toast.error("Upload failed", {
          description: "The file couldn't be uploaded. Check if it's a valid PDF file and try again."
        });
      }
    } catch (error) {
      console.error('Error uploading files!', error);
      toast.error('File upload error', {
        description: 'There was a problem uploading your file. Please try again or contact support.'
      });
    } finally {
      setUploadQueue([]);
    }
  };

  const processPdfForFlashcards = async (pdfAttachment: Attachment) => {
    console.log("Processing PDF for flashcards:", pdfAttachment);
    setImportPreview([]); // Clear any existing preview
    setIsProcessing(true);
    
    try {
      // Ensure we have a valid URL
      if (!pdfAttachment.url) {
        throw new Error('PDF URL is missing');
      }

      // Call the server endpoint for PDF extraction
      const response = await fetch('/api/flashcards/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: pdfAttachment.url,
          fileName: pdfAttachment.name,
          maxCards: 10, // Limit to 10 cards for this example
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract flashcards from PDF');
      }

      // Handle the streaming response from the server
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      const decoder = new TextDecoder();
      let buffer = '';
      let extractedCards: BatchCard[] = [];
      
      toast.info("Analyzing PDF content...");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode and append to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete event-stream messages
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const json = JSON.parse(data);
              console.log("Received data from server:", json);
              
              if (json.cards && Array.isArray(json.cards)) {
                // Convert the cards to our BatchCard format
                extractedCards = json.cards.map((card: any) => {
                  if (typeof card === 'object' && card && 'front' in card && 'back' in card) {
                    return {
                      id: generateId(),
                      front: String(card.front || ''),
                      back: String(card.back || ''),
                      isValid: Boolean(card.front) && Boolean(card.back)
                    };
                  }
                  return {
                    id: generateId(),
                    front: '',
                    back: '',
                    isValid: false
                  };
                });
                
                // Update the UI with the extracted cards
                setImportPreview(extractedCards);
                console.log("Updated preview with extracted cards:", extractedCards);
              }
            } catch (error) {
              console.error('Error parsing server response:', error);
            }
          }
        }
      }
      
      if (extractedCards.length > 0) {
        toast.success(`Extracted ${extractedCards.length} flashcards from PDF`);
      } else {
        toast.error('No flashcards could be extracted', {
          description: 'The PDF may not contain suitable content for flashcards'
        });
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Failed to process PDF', {
        description: error instanceof Error ? error.message : 'Could not extract flashcards from the document'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const SeparatorButton = ({ 
    value, 
    current, 
    onClick, 
    label 
  }: { 
    value: string, 
    current: string, 
    onClick: () => void, 
    label: string 
  }) => (
    <Button
      variant={current === value ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className="h-7 text-xs"
    >
      {label}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import Flashcards</DialogTitle>
        </DialogHeader>
        
        <div className="flex space-x-2 mb-4">
          <Button
            variant={importMethod === 'text' ? 'default' : 'outline'}
            onClick={() => setImportMethod('text')}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Text Import
          </Button>
          <Button
            variant={importMethod === 'file' ? 'default' : 'outline'}
            onClick={() => setImportMethod('file')}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            File Upload
          </Button>
        </div>
        
        {importMethod === 'text' ? (
          <div className="mb-4">
            <h3 className="font-medium mb-1">Import Format</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Paste tab or comma-separated text in the format: Front[tab]Back (one per line)
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="text-sm font-medium">Separator:</div>
              <SeparatorButton 
                value="\t" 
                current={importSeparator} 
                onClick={() => setImportSeparator('\t')} 
                label="Tab" 
              />
              <SeparatorButton 
                value="," 
                current={importSeparator} 
                onClick={() => setImportSeparator(',')} 
                label="Comma" 
              />
              <SeparatorButton 
                value=";" 
                current={importSeparator} 
                onClick={() => setImportSeparator(';')} 
                label="Semicolon" 
              />
            </div>
            
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="min-h-[150px]"
              placeholder={`Question${importSeparator}Answer\nCapital of France${importSeparator}Paris\nLargest planet${importSeparator}Jupiter`}
            />
            
            <div className="flex justify-end mt-3">
              <Button 
                onClick={handleImportPreview}
                disabled={!importText.trim()}
              >
                <FileText className="h-4 w-4 mr-1" />
                Preview Import
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="font-medium mb-1">File Upload</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Upload a PDF file containing your flashcard content.
            </p>
            
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
            />
            
            <Button
              onClick={() => {
                console.log("File chooser button clicked, fileInputRef:", fileInputRef.current);
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  console.error("File input reference is missing");
                  toast.error("Could not open file chooser");
                }
              }}
              variant="outline" 
              className="w-full h-12 border-dashed"
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose PDF File
            </Button>
            
            {attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                <div className="flex flex-row gap-2 overflow-x-auto items-end">
                  {attachments.map((attachment) => (
                    <div key={attachment.url} className="relative">
                      <PreviewAttachment key={attachment.url} attachment={attachment} />
                      <button 
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1"
                        onClick={() => {
                          setAttachments(current => current.filter(a => a.url !== attachment.url));
                          setImportPreview([]);
                        }}
                        disabled={isProcessing}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {uploadQueue.map((filename) => (
                    <PreviewAttachment
                      key={filename}
                      attachment={{
                        url: '',
                        name: filename,
                        contentType: '',
                      }}
                      isUploading={true}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {isProcessing && (
              <div className="mt-4 flex items-center justify-center p-4 border rounded-md border-muted">
                <div className="animate-spin mr-2">
                  <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <span className="text-sm">Processing PDF content...</span>
              </div>
            )}
          </div>
        )}
        
        {importPreview.length > 0 && (
          <div className="border rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Import Preview</h3>
              <Badge variant="outline">
                {importPreview.length} cards
              </Badge>
            </div>
            
            <ScrollArea className="h-[170px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead style={{ width: '40px' }}>#</TableHead>
                    <TableHead className="w-[45%]">Front</TableHead>
                    <TableHead className="w-[45%]">Back</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importPreview.map((card, index) => (
                    <TableRow key={card.id}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {card.front}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {card.back}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (importPreview.length > 0) {
                onImport(importPreview);
                onOpenChange(false);
              } else if (importMethod === 'file' && attachments.length > 0) {
                // Try to process the first PDF attachment
                const pdfAttachments = attachments.filter(
                  att => att.contentType === 'application/pdf'
                );
                
                if (pdfAttachments.length > 0) {
                  processPdfForFlashcards(pdfAttachments[0]);
                } else {
                  toast.error("No PDF files to process");
                }
              } else {
                toast.error("No content to import", {
                  description: importMethod === 'text' 
                    ? "Please preview your text import first" 
                    : "Please upload a PDF file first"
                });
              }
            }}
            disabled={(importMethod === 'text' && importPreview.length === 0) || 
                     (importMethod === 'file' && attachments.length === 0) ||
                     isProcessing}
          >
            <Download className="h-4 w-4 mr-1" />
            {importPreview.length > 0 
              ? `Import ${importPreview.length} Cards` 
              : importMethod === 'file' && attachments.length > 0
                ? 'Process File'
                : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Utility functions
const generateId = () => `temp-${Math.random().toString(36).substring(2, 11)}`;

const createEmptyCard = (): BatchCard => ({
  id: generateId(),
  front: '',
  back: '',
  isValid: false
});

// Main component
const FlashcardCardDialog: React.FC<FlashcardCardDialogProps> = ({
  open,
  onOpenChange,
  card,
  onSave,
  libraryId,
}) => {
  // Batch creation state
  const [batchCards, setBatchCards] = useState<BatchCard[]>([]);
  const [currentFocus, setCurrentFocus] = useState<{row: number, column: 'front' | 'back'} | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  
  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  // AI generation dialog state
  const [generateAIDialogOpen, setGenerateAIDialogOpen] = useState(false);
  
  // Initialize on open
  useEffect(() => {
    if (open) {
      if (card) {
        // Edit mode - single card
        setBatchCards([{
          id: card.id || generateId(),
          front: card.front,
          back: card.back,
          isValid: true
        }]);
      } else {
        // Create mode
        setBatchCards([createEmptyCard()]);
      }
    }
  }, [card, open]);

  // Focus management
  useEffect(() => {
    if (currentFocus && tableRef.current) {
      const cell = tableRef.current.querySelector(
        `[data-row="${currentFocus.row}"][data-column="${currentFocus.column}"]`
      ) as HTMLElement;
      
      if (cell) {
        const input = cell.querySelector('input, textarea') as HTMLElement;
        if (input) {
          input.focus();
        }
      }
    }
  }, [currentFocus, batchCards.length]);

  // Batch creation handlers
  const addNewCard = () => {
    setBatchCards([...batchCards, createEmptyCard()]);
    setCurrentFocus({ row: batchCards.length, column: 'front' });
  };

  const removeCard = (index: number) => {
    const newCards = [...batchCards];
    newCards.splice(index, 1);
    setBatchCards(newCards.length > 0 ? newCards : [createEmptyCard()]);
  };

  const updateCardField = (index: number, field: 'front' | 'back', value: string) => {
    const newCards = [...batchCards];
    newCards[index][field] = value;
    newCards[index].isValid = !!newCards[index].front && !!newCards[index].back;
    setBatchCards(newCards);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: 'front' | 'back') => {
    // Tab + Shift = Previous field
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      
      if (field === 'back' && index >= 0) {
        setCurrentFocus({ row: index, column: 'front' });
      } else if (field === 'front' && index > 0) {
        setCurrentFocus({ row: index - 1, column: 'back' });
      }
    }
    // Tab = Next field
    else if (e.key === 'Tab') {
      e.preventDefault();
      
      if (field === 'front') {
        setCurrentFocus({ row: index, column: 'back' });
      } else if (field === 'back') {
        if (index === batchCards.length - 1) {
          addNewCard();
        } else {
          setCurrentFocus({ row: index + 1, column: 'front' });
        }
      }
    }
    // Enter = New card
    else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNewCard();
    }
    // Shift+Enter = Multiline in same field
    else if (e.key === 'Enter' && e.shiftKey) {
      // Allow default behavior for multiline
      return;
    }
    // Alt+D = Delete current card
    else if (e.key === 'd' && e.altKey) {
      e.preventDefault();
      removeCard(index);
    }
  };

  // Import handling
  const handleImportedCards = (importedCards: BatchCard[]) => {
    // Append imported cards to existing cards
    setBatchCards([...batchCards, ...importedCards]);
    toast.success(`${importedCards.length} cards imported`);
  };

  // Generate AI cards
  const handleGenerateAI = () => {
    setGenerateAIDialogOpen(true);
  };

  const handleGeneratedCards = (generatedCards: BatchCard[]) => {
    // Append generated cards to existing cards
    setBatchCards([...batchCards, ...generatedCards]);
    toast.success(`${generatedCards.length} cards generated with AI`);
  };

  // Save all cards
  const saveAllCards = () => {
    const validCards = batchCards.filter(card => card.isValid);
    
    if (validCards.length === 0) {
      toast.error("No valid cards", {
        description: "Please complete at least one card before saving."
      });
      return;
    }
    
    // If editing a single card
    if (card && validCards.length === 1) {
      onSave({
        id: card.id,
        front: validCards[0].front,
        back: validCards[0].back
      });
    } 
    // If creating new cards
    else {
      // Create each card one by one
      validCards.forEach((validCard, index) => {
        // Small delay between card creations to prevent race conditions
        setTimeout(() => {
          onSave({
            front: validCard.front,
            back: validCard.back
          });
          
          // Only show notification for the last card to avoid spamming
          if (index === validCards.length - 1) {
            toast.success(`Created ${validCards.length} flashcards`);
          }
        }, index * 50); // 50ms delay between card creations
      });
    }
    
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Book className="h-5 w-5" />
              {card ? 'Edit Flashcard' : 'Create Flashcards'}
              <KeyboardShortcutsTooltip />
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 min-h-0">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="h-6">
                  {batchCards.filter(c => c.isValid).length} valid cards
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={addNewCard} 
                  className="flex items-center gap-1 h-7"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Card
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateAI}
                  className="h-7"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Generate with AI
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                  className="h-7"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Import
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newCards = [...batchCards];
                    newCards.sort((a, b) => a.front.localeCompare(b.front));
                    setBatchCards(newCards);
                  }}
                  className="h-7"
                >
                  <ArrowDownUp className="h-3.5 w-3.5 mr-1" />
                  Sort
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[400px] border rounded-md">
              <Table ref={tableRef}>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead style={{ width: '40px' }}>#</TableHead>
                    <TableHead className="w-[45%]">Front (Question)</TableHead>
                    <TableHead className="w-[45%]">Back (Answer)</TableHead>
                    <TableHead style={{ width: '60px' }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchCards.map((batchCard, index) => (
                    <TableRow key={batchCard.id} data-row-valid={batchCard.isValid}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell data-row={index} data-column="front">
                        <Textarea
                          value={batchCard.front}
                          onChange={(e) => updateCardField(index, 'front', e.target.value)}
                          onFocus={() => setCurrentFocus({ row: index, column: 'front' })}
                          onKeyDown={(e) => handleKeyDown(e, index, 'front')}
                          placeholder="Enter question or term"
                          className="min-h-[80px] resize-none"
                        />
                      </TableCell>
                      <TableCell data-row={index} data-column="back">
                        <Textarea
                          value={batchCard.back}
                          onChange={(e) => updateCardField(index, 'back', e.target.value)}
                          onFocus={() => setCurrentFocus({ row: index, column: 'back' })}
                          onKeyDown={(e) => handleKeyDown(e, index, 'back')}
                          placeholder="Enter answer or definition"
                          className="min-h-[80px] resize-none"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCard(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          
          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveAllCards}
              disabled={batchCards.filter(c => c.isValid).length === 0}
              className="gap-1"
            >
              <CheckCircle2 className="h-4 w-4" />
              {card ? 'Save Changes' : 'Create Cards'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ImportDialog 
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportedCards}
      />

      <GenerateAIDialog
        open={generateAIDialogOpen}
        onOpenChange={setGenerateAIDialogOpen}
        onGenerate={handleGeneratedCards}
        libraryId={libraryId}
      />
    </>
  );
};

// Generate AI Dialog
const GenerateAIDialog = ({
  open,
  onOpenChange,
  onGenerate,
  libraryId
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (cards: BatchCard[]) => void;
  libraryId: string;
}) => {
  const [topic, setTopic] = useState<string>('');
  const [numCards, setNumCards] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCards, setGeneratedCards] = useState<BatchCard[]>([]);
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setTopic('');
      setNumCards(5);
      setGeneratedCards([]);
      setGenerationProgress(0);
      setIsGenerating(false);
    }
  }, [open]);

  const generateFlashcards = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    setGeneratedCards([]);
    setGenerationProgress(0);

    try {
      // Call the server endpoint instead of directly using streamObject in the client
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          numCards,
          libraryId, // Pass the library ID for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      // Handle the streaming response from the server
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      const decoder = new TextDecoder();
      let buffer = '';
      let generatedBatchCards: BatchCard[] = [];
      let progress = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode and append to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete event-stream messages
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const json = JSON.parse(data);
              
              if (json.cards && Array.isArray(json.cards)) {
                // Convert the cards to our BatchCard format
                generatedBatchCards = json.cards.map((card: any) => {
                  if (typeof card === 'object' && card && 'front' in card && 'back' in card) {
                    return {
                      id: generateId(),
                      front: String(card.front || ''),
                      back: String(card.back || ''),
                      isValid: Boolean(card.front) && Boolean(card.back)
                    };
                  }
                  return {
                    id: generateId(),
                    front: '',
                    back: '',
                    isValid: false
                  };
                });

                // Update progress
                progress = Math.min(100, progress + 10);
                setGenerationProgress(progress);
                
                // Update the UI with the generated cards
                setGeneratedCards(generatedBatchCards);
              }
            } catch (error) {
              console.error('Error parsing server response:', error);
            }
          }
        }
      }

      // Finalize progress
      setGenerationProgress(100);
      
      setTimeout(() => {
        setIsGenerating(false);
        toast.success(`Generated ${generatedBatchCards.length} flashcards`);
      }, 500);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error("Failed to generate flashcards", {
        description: "Please try again with a different topic or number of cards."
      });
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Generate Flashcards with AI</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Topic or Subject</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., World Capitals, Human Anatomy, JavaScript Basics"
                disabled={isGenerating}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Number of Cards</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={numCards}
                  onChange={(e) => setNumCards(parseInt(e.target.value))}
                  disabled={isGenerating}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8 text-center">{numCards}</span>
              </div>
            </div>
            
            {!isGenerating && generatedCards.length === 0 && (
              <Button 
                onClick={generateFlashcards}
                disabled={!topic.trim() || isGenerating}
                className="w-full"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Generate Flashcards
              </Button>
            )}
            
            {isGenerating && (
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Generating flashcards... {generationProgress}%
                </p>
              </div>
            )}
          </div>
        </div>
        
        {generatedCards.length > 0 && (
          <div className="border rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Generated Flashcards</h3>
              <Badge variant="outline">
                {generatedCards.length} cards
              </Badge>
            </div>
            
            <ScrollArea className="h-[230px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead style={{ width: '40px' }}>#</TableHead>
                    <TableHead className="w-[45%]">Front</TableHead>
                    <TableHead className="w-[45%]">Back</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedCards.map((card, index) => (
                    <TableRow key={card.id}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {card.front}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {card.back}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (generatedCards.length > 0) {
                onGenerate(generatedCards);
                onOpenChange(false);
              } else {
                toast.error("No cards generated yet");
              }
            }}
            disabled={generatedCards.length === 0 || isGenerating}
          >
            <Download className="h-4 w-4 mr-1" />
            Add {generatedCards.length} Cards
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardCardDialog; 