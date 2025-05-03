'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderPlus } from 'lucide-react';
import { NotesList } from './NotesList';
import { NoteEditor } from './NoteEditor';
import { CreateLibraryDialog } from './CreateLibraryDialog';
import { Note, NoteLibrary } from './types';

// Local storage keys
const NOTES_STORAGE_KEY = 'semblancy-notes';
const LIBRARIES_STORAGE_KEY = 'semblancy-libraries';

export function NotesContainer() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all-notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreateLibraryOpen, setIsCreateLibraryOpen] = useState(false);
  const [libraries, setLibraries] = useState<NoteLibrary[]>([
    { id: 'default', name: 'General Notes', color: '#6366F1' },
    { id: 'research', name: 'Research', color: '#8B5CF6' },
    { id: 'lectures', name: 'Lecture Notes', color: '#EC4899' },
  ]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load notes and libraries from localStorage
  useEffect(() => {
    setIsClient(true);
    
    try {
      // Load libraries
      const savedLibraries = localStorage.getItem(LIBRARIES_STORAGE_KEY);
      if (savedLibraries) {
        setLibraries(JSON.parse(savedLibraries));
      } else {
        // Save default libraries if none exist
        localStorage.setItem(LIBRARIES_STORAGE_KEY, JSON.stringify(libraries));
      }
      
      // Load notes
      const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        
        // If we have notes, select the first one
        if (parsedNotes.length > 0) {
          setSelectedNote(parsedNotes[0]);
        }
      } else {
        // Save the demo notes to localStorage
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isClient && notes.length > 0) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isClient]);

  // Save libraries to localStorage whenever they change
  useEffect(() => {
    if (isClient && libraries.length > 0) {
      localStorage.setItem(LIBRARIES_STORAGE_KEY, JSON.stringify(libraries));
    }
  }, [libraries, isClient]);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      libraryId: activeTab === 'all-notes' ? 'default' : activeTab,
      tags: [],
    };
    
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const handleSaveNote = (updatedNote: Note) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
    setSelectedNote(updatedNote);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const handleCreateLibrary = (name: string, color: string) => {
    const newLibrary: NoteLibrary = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
    };
    setLibraries([...libraries, newLibrary]);
    setIsCreateLibraryOpen(false);
  };

  const filteredNotes = notes.filter(note => {
    // Filter by library
    if (activeTab !== 'all-notes' && note.libraryId !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !note.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Notes</h1>
        <p className="text-muted-foreground">Organize and manage your study notes</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Left sidebar */}
        <div className="w-full md:w-80 flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={handleCreateNote} className="flex-1 flex gap-2 items-center">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateLibraryOpen(true)}
              className="px-3"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all-notes">All</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="all-notes" className="flex-1 data-[state=active]:flex flex-col">
              <div className="space-y-1 mb-6">
                <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase mb-2">Libraries</h3>
                <ul>
                  {libraries.map(library => (
                    <li key={library.id}>
                      <button
                        onClick={() => setActiveTab(library.id)}
                        className={`w-full text-left p-2 rounded-md flex items-center gap-2 hover:bg-muted/50 ${
                          activeTab === library.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: library.color }} />
                        {library.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {isClient && (
                <NotesList 
                  notes={filteredNotes} 
                  selectedNoteId={selectedNote?.id}
                  onSelectNote={(note) => {
                    setSelectedNote(note);
                  }}
                  onDeleteNote={handleDeleteNote}
                />
              )}
            </TabsContent>

            <TabsContent value="recent" className="flex-1 data-[state=active]:flex flex-col">
              {isClient && (
                <NotesList 
                  notes={notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10)} 
                  selectedNoteId={selectedNote?.id}
                  onSelectNote={(note) => {
                    setSelectedNote(note);
                  }}
                  onDeleteNote={handleDeleteNote}
                />
              )}
            </TabsContent>

            <TabsContent value="favorites" className="flex-1 data-[state=active]:flex flex-col">
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                <p>Favorite functionality coming soon</p>
              </div>
            </TabsContent>

            {libraries.map(library => (
              <TabsContent key={library.id} value={library.id} className="flex-1 data-[state=active]:flex flex-col">
                {isClient && (
                  <NotesList 
                    notes={notes.filter(note => note.libraryId === library.id)} 
                    selectedNoteId={selectedNote?.id}
                    onSelectNote={(note) => {
                      setSelectedNote(note);
                    }}
                    onDeleteNote={handleDeleteNote}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-h-[500px] border rounded-lg overflow-hidden bg-card">
          {selectedNote && isClient ? (
            <NoteEditor 
              note={selectedNote} 
              onSave={handleSaveNote}
              onDelete={() => handleDeleteNote(selectedNote.id)} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <h3 className="text-xl font-medium mb-2">No note selected</h3>
              <p className="text-muted-foreground mb-6">Select a note from the list or create a new one</p>
              {isClient && (
                <Button onClick={handleCreateNote}>Create a new note</Button>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateLibraryDialog 
        open={isCreateLibraryOpen} 
        onOpenChange={setIsCreateLibraryOpen} 
        onCreateLibrary={handleCreateLibrary} 
      />
    </div>
  );
} 