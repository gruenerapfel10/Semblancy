'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, Plus, Maximize2, Minimize2, Save } from 'lucide-react';
import { MDXNoteEditor } from './MDXNoteEditor';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { Note } from './types';
import { format } from 'date-fns';

interface NoteEditorProps {
  note: Note;
  onSave: (updatedNote: Note) => void;
  onDelete: () => void;
}

export function NoteEditor({ note, onSave, onDelete }: NoteEditorProps) {
  // State for the editor
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState(note.tags || []);
  const [newTag, setNewTag] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(note.updatedAt);
  const [isDirty, setIsDirty] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const editorRef = useRef<MDXEditorMethods>(null);

  // Keep track of the current content
  const [content, setContent] = useState(note.content);

  // Effect to update the state when the note changes
  useEffect(() => {
    setTitle(note.title);
    setTags(note.tags || []);
    setContent(note.content);
    setLastSavedAt(note.updatedAt);
    setIsDirty(false);
    
    // Force editor content update if needed
    if (editorRef.current && editorRef.current.getMarkdown() !== note.content) {
      editorRef.current.setMarkdown(note.content);
    }
  }, [note.id, note.title, note.content, note.tags, note.updatedAt]);

  // Handle saving the note (using useCallback to avoid dependency issues)
  const handleSave = useCallback(() => {
    if (!editorRef.current) return;
    
    const currentContent = editorRef.current.getMarkdown();
    
    const updatedNote: Note = {
      ...note,
      title,
      tags,
      content: currentContent,
      updatedAt: new Date().toISOString(),
    };
    
    setContent(currentContent);
    setLastSavedAt(updatedNote.updatedAt);
    setIsDirty(false);
    onSave(updatedNote);
  }, [note, title, tags, onSave]);

  // Handle editor content changes
  const handleEditorChange = (markdown: string) => {
    setIsDirty(true);
    setContent(markdown);
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setIsDirty(true);
  };

  // Handle adding a new tag
  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
      setIsDirty(true);
    }
  };

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullScreen]);

  // Save on component unmount or when switching notes
  useEffect(() => {
    // Return cleanup function that saves when component unmounts
    // or when note/content/title/tags dependencies change
    return () => {
      if (isDirty && editorRef.current) {
        const currentContent = editorRef.current.getMarkdown();
        const updatedNote: Note = {
          ...note,
          title,
          tags,
          content: currentContent,
          updatedAt: new Date().toISOString(),
        };
        onSave(updatedNote);
      }
    };
  }, [note, title, tags, isDirty, onSave]);

  // Save on page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty && editorRef.current) {
        const currentContent = editorRef.current.getMarkdown();
        const updatedNote: Note = {
          ...note,
          title,
          tags,
          content: currentContent,
          updatedAt: new Date().toISOString(),
        };
        onSave(updatedNote);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [note, title, tags, isDirty, onSave]);

  return (
    <div className={`flex flex-col ${isFullScreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'}`}>
      {/* Header with title and actions */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsDirty(true);
            }}
            className="w-full bg-transparent border-none text-2xl font-semibold focus:outline-none"
            placeholder="Untitled Note"
          />
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span>
              {isDirty ? "Unsaved changes" : `Last saved: ${format(new Date(lastSavedAt), 'MMM d, h:mm a')}`}
            </span>
            {tags && tags.length > 0 && (
              <div className="flex gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-muted rounded-full text-xs flex items-center"
                  >
                    {tag}
                    <button 
                      onClick={() => removeTag(tag)} 
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="bg-transparent text-xs w-20 border-none focus:outline-none focus:ring-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button 
                onClick={addTag}
                disabled={!newTag}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          {isDirty && (
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete} 
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* MDX Editor */}
      <div className="flex-1 overflow-auto">
        <MDXNoteEditor 
          ref={editorRef}
          markdown={content}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
} 