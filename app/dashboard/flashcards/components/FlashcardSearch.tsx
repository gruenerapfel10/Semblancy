"use client";

import React, { useRef, useEffect } from 'react';
import { useFlashcards, SearchResult } from './FlashcardContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Search, X, Library, FileText, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const FlashcardSearch = () => {
  const {
    searchQuery,
    searchResults,
    isSearchOpen,
    setSearchQuery,
    performSearch,
    openSearch,
    closeSearch,
    setSelectedLibraryId
  } = useFlashcards();

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the search dialog opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Handle clicking on a search result
  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'library') {
      setSelectedLibraryId(result.id);
    } else if (result.type === 'card' && result.libraryId) {
      setSelectedLibraryId(result.libraryId);
      // Could add logic here to scroll to the specific card
    }
    closeSearch();
  };

  // Render the search result
  const renderSearchResult = (result: SearchResult) => (
    <div 
      key={`${result.type}-${result.id}`}
      className="p-3 hover:bg-muted rounded-md cursor-pointer transition-colors"
      onClick={() => handleResultClick(result)}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          {result.type === 'library' ? (
            <Library className="h-4 w-4 text-primary" />
          ) : (
            <FileText className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{result.title}</div>
          
          {result.type === 'card' && (
            <>
              <div className="text-muted-foreground text-sm truncate">
                {result.content || ''}
              </div>
              {result.libraryName && (
                <div className="text-xs text-muted-foreground mt-1">
                  in <span className="font-medium">{result.libraryName}</span>
                </div>
              )}
            </>
          )}
          
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {result.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-1">
            Matched in: {result.matchField}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Search button to open the dialog */}
      <Button
        variant="ghost"
        size="icon"
        onClick={openSearch}
        className="h-9 w-9"
        aria-label="Search flashcards"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Search dialog */}
      <Dialog open={isSearchOpen} onOpenChange={(open) => !open && closeSearch()}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-2">
            <DialogTitle>Search Flashcards</DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <Input
              ref={inputRef}
              className="pl-10 pr-10"
              placeholder="Search libraries and cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto mt-4 -mr-4 pr-4">
            {searchResults.length === 0 && searchQuery.trim().length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No results found for &quot;{searchQuery}&quot;
              </div>
            )}
            
            {searchResults.length === 0 && searchQuery.trim().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Start typing to search...
              </div>
            )}
            
            <div className="space-y-2">
              {searchResults.map(renderSearchResult)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
