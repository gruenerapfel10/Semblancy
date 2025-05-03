'use client';

import React from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Note } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | undefined;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NotesList({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
}: NotesListProps) {
  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
        <p className="mb-2">No notes found</p>
        <p className="text-sm">Click "New Note" above to create your first note</p>
      </div>
    );
  }

  const getFirstLine = (content: string): string => {
    const lines = content.split('\n');
    
    // If the first line is a Markdown heading, return without the #
    if (lines[0].startsWith('#')) {
      return lines[0].replace(/^#+\s*/, '');
    }
    
    // Return the first non-empty line
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('---')) {
        // Remove markdown formatting for better preview
        return trimmed
          .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
          .replace(/\*(.*?)\*/g, '$1')     // Italic
          .replace(/`(.*?)`/g, '$1')       // Inline code
          .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links
      }
    }
    
    return 'Empty note';
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-300px)]">
      {notes.map((note) => (
        <div
          key={note.id}
          className={cn(
            "p-3 rounded-md cursor-pointer group border-l-2 hover:bg-muted/50 transition-colors",
            selectedNoteId === note.id
              ? "bg-muted border-l-primary"
              : "border-l-transparent"
          )}
          onClick={() => onSelectNote(note)}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium truncate">
              {note.title || 'Untitled Note'}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground overflow-hidden line-clamp-2 max-h-10">
            {truncateText(getFirstLine(note.content), 100)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {format(new Date(note.updatedAt), 'MMM d, yyyy')}
            </span>
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-1">
                {note.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-muted rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {note.tags.length > 2 && (
                  <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                    +{note.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 