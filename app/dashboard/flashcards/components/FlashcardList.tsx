import React, { useMemo, useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Flashcard, FlashcardLibrary } from './types';
import { Pencil, Trash2, Plus, BookOpen, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FlashcardListProps {
  library: FlashcardLibrary;
  onEdit: (card: Flashcard) => void;
  onDelete: (card: Flashcard) => void;
  onAdd: () => void;
  searchQuery?: string;
}

const FlashcardList: React.FC<FlashcardListProps> = ({
  library,
  onEdit,
  onDelete,
  onAdd,
  searchQuery: externalSearchQuery,
}) => {
  // Local state for search if not provided externally
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  
  // Use external search query if provided, otherwise use internal
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  
  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return library.cards;
    
    const query = searchQuery.toLowerCase().trim();
    return library.cards.filter(card => 
      card.front.toLowerCase().includes(query) || 
      card.back.toLowerCase().includes(query)
    );
  }, [library.cards, searchQuery]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{library.name}</h1>
            <Badge variant="outline" className="text-sm py-1">
              {filteredCards.length} / {library.cards.length} {library.cards.length === 1 ? 'card' : 'cards'}
            </Badge>
          </div>
          {library.description && (
            <p className="text-muted-foreground mt-1 max-w-2xl">{library.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              value={externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery}
              onChange={(e) => {
                if (externalSearchQuery === undefined) {
                  setInternalSearchQuery(e.target.value);
                }
              }}
              className="h-9 w-full md:w-60 pl-8"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  if (externalSearchQuery === undefined) {
                    setInternalSearchQuery('');
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onAdd} className="flex items-center gap-2" size="sm">
                  <Plus className="h-4 w-4" /> Add Card
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create New Card (Ctrl+N)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <ScrollArea className="flex-grow">
        {filteredCards.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              {library.cards.length === 0 ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">No flashcards yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground max-w-sm mt-1">
                    Create your first flashcard to start learning and building your knowledge
                  </p>
                  <Button onClick={onAdd} className="flex items-center gap-2 mt-2">
                    <Plus className="h-4 w-4" /> Add Your First Card
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium">No matching cards</h3>
                  <p className="mb-4 text-sm text-muted-foreground max-w-sm mt-1">
                    No cards match your search query &quot;{searchQuery}&quot;
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-[1fr,1fr,auto] gap-4">
                      <div className="p-4 border-r">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Front</div>
                        <div className="text-sm text-muted-foreground">
                          &quot;{card.front}&quot;
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Back</div>
                        <div>{card.back}</div>
                      </div>
                      <div className="flex items-center justify-center pr-4 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(card)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(card)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default FlashcardList; 