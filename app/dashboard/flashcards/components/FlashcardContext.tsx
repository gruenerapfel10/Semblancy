"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Flashcard, FlashcardLibrary, StudyMode, SessionType } from './types';

// Local storage keys
const LIBRARIES_STORAGE_KEY = "flashcard-libraries";
const SESSIONS_STORAGE_KEY = "flashcard-study-sessions";
const GROUPS_STORAGE_KEY = "flashcard-groups";
const UNGROUPED_STORAGE_KEY = "flashcard-ungrouped";

// Type for library group
interface LibraryGroup {
  id: string;
  name: string;
  libraries: string[]; // Library IDs
}

// Demo data for initial state
const getDemoData = (): FlashcardLibrary[] => [
  {
    id: "lib-1",
    name: "JavaScript Fundamentals",
    description: "Basic concepts in JavaScript",
    cards: [
      { id: "card-1", front: "What is a closure?", back: "A function that has access to its outer function's variables." },
      { id: "card-2", front: "What is hoisting?", back: "JavaScript's behavior of moving declarations to the top of the current scope." },
      { id: "card-3", front: "Difference between let and var?", back: "let is block-scoped, var is function-scoped." },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "lib-2",
    name: "React Hooks",
    description: "Common React hooks and their usage",
    cards: [
      { id: "card-4", front: "What is useState?", back: "A hook that lets you add state to functional components." },
      { id: "card-5", front: "What is useEffect?", back: "A hook for side effects in functional components." },
      { id: "card-6", front: "What is useContext?", back: "A hook that lets you subscribe to a context without nesting." },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Update StudySessionResult interface to match StudySession type and export it
export interface StudySessionResult {
  id: string;
  libraryId: string;
  libraryName: string;
  startTime: Date;   
  endTime?: Date;   
  studyMode: StudyMode;
  sessionType: SessionType;
  correct: number;  
  total: number;    
  score: number;
  reps?: number;    
}

/**
 * FlashcardManager class to handle all operations related to flashcards
 * Following OOP principles to centralize business logic
 */
class FlashcardManager {
  private libraries: FlashcardLibrary[] = [];
  private studySessions: StudySessionResult[] = [];
  private groups: LibraryGroup[] = [];
  private ungroupedLibraries: string[] = [];
  
  // Subscribers for state changes
  private subscribers: (() => void)[] = [];
  
  constructor() {
    this.loadData();
    
    // Set up default group if none exists
    if (this.groups.length === 0) {
      this.groups = [
        { id: 'default-group', name: 'General', libraries: [] }
      ];
    }
  }
  
  // Load data from localStorage
  private loadData() {
    // Skip loading from localStorage during server-side rendering
    if (typeof window === 'undefined') {
      this.libraries = getDemoData();
      this.studySessions = [];
      this.groups = [{ id: 'default-group', name: 'General', libraries: [] }];
      this.ungroupedLibraries = this.libraries.map(lib => lib.id);
      return;
    }
    
    try {
      // Load libraries
      const savedLibraries = localStorage.getItem(LIBRARIES_STORAGE_KEY);
      if (savedLibraries) {
        this.libraries = JSON.parse(savedLibraries);
      } else {
        this.libraries = getDemoData();
      }
      
      // Load study sessions
      const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (savedSessions) {
        this.studySessions = JSON.parse(savedSessions);
        // Convert string dates back to Date objects
        this.studySessions = this.studySessions.map(session => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        }));
      }
      
      // Load groups
      const savedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (savedGroups) {
        this.groups = JSON.parse(savedGroups);
      }
      
      // Load ungrouped libraries
      const savedUngrouped = localStorage.getItem(UNGROUPED_STORAGE_KEY);
      if (savedUngrouped) {
        this.ungroupedLibraries = JSON.parse(savedUngrouped);
      } else {
        // All libraries are ungrouped by default
        this.ungroupedLibraries = this.libraries.map(lib => lib.id);
      }
      
      // Set up default group if none exists
      if (this.groups.length === 0) {
        this.groups = [
          { id: 'default-group', name: 'General', libraries: [] }
        ];
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      // Use demo data if there's an error
      this.libraries = getDemoData();
      this.studySessions = [];
      this.groups = [{ id: 'default-group', name: 'General', libraries: [] }];
      this.ungroupedLibraries = this.libraries.map(lib => lib.id);
    }
  }
  
  // Save all data to localStorage
  private saveData() {
    // Skip saving during server-side rendering
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(LIBRARIES_STORAGE_KEY, JSON.stringify(this.libraries));
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(this.studySessions));
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(this.groups));
      localStorage.setItem(UNGROUPED_STORAGE_KEY, JSON.stringify(this.ungroupedLibraries));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
    
    // Notify subscribers
    this.notifySubscribers();
  }
  
  // Subscribe to state changes
  public subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  // Notify all subscribers of state changes
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }
  
  // Get all libraries
  public getLibraries(): FlashcardLibrary[] {
    return [...this.libraries];
  }
  
  // Get library by ID
  public getLibrary(id: string): FlashcardLibrary | null {
    return this.libraries.find(lib => lib.id === id) || null;
  }
  
  // Get study sessions
  public getStudySessions(): StudySessionResult[] {
    return [...this.studySessions];
  }
  
  // Get study sessions for a specific library
  public getLibraryStudySessions(libraryId: string): StudySessionResult[] {
    return this.studySessions.filter(session => session.libraryId === libraryId);
  }
  
  // Get all groups
  public getGroups(): LibraryGroup[] {
    return [...this.groups];
  }
  
  // Get ungrouped libraries
  public getUngroupedLibraries(): string[] {
    return [...this.ungroupedLibraries];
  }
  
  // Get ungrouped library objects
  public getUngroupedLibraryObjects(): FlashcardLibrary[] {
    return this.libraries.filter(lib => this.ungroupedLibraries.includes(lib.id));
  }
  
  // Get libraries in a group
  public getGroupLibraries(groupId: string): FlashcardLibrary[] {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) return [];
    return this.libraries.filter(lib => group.libraries.includes(lib.id));
  }
  
  // LIBRARY CRUD OPERATIONS
  
  // Add a new library
  public addLibrary(libraryData: Partial<FlashcardLibrary>): string {
    const newLibrary: FlashcardLibrary = {
      id: `lib-${Date.now()}`,
      name: libraryData.name || 'New Library',
      description: libraryData.description || '',
      cards: libraryData.cards || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.libraries.push(newLibrary);
    
    // Add to ungrouped by default
    this.ungroupedLibraries.push(newLibrary.id);
    
    this.saveData();
    return newLibrary.id;
  }
  
  // Update an existing library
  public updateLibrary(libraryData: Partial<FlashcardLibrary>): void {
    if (!libraryData.id) return;
    
    const index = this.libraries.findIndex(lib => lib.id === libraryData.id);
    if (index === -1) return;
    
    this.libraries[index] = {
      ...this.libraries[index],
      ...libraryData,
      updatedAt: new Date(),
    };
    
    this.saveData();
  }
  
  // Delete a library
  public deleteLibrary(id: string): void {
    this.libraries = this.libraries.filter(lib => lib.id !== id);
    
    // Remove from groups
    this.groups = this.groups.map(group => ({
      ...group,
      libraries: group.libraries.filter(libId => libId !== id)
    }));
    
    // Remove from ungrouped
    this.ungroupedLibraries = this.ungroupedLibraries.filter(libId => libId !== id);
    
    // Remove associated study sessions
    this.studySessions = this.studySessions.filter(session => session.libraryId !== id);
    
    this.saveData();
  }
  
  // CARD OPERATIONS
  
  // Add a card to a library
  public addCard(libraryId: string, cardData: Partial<Flashcard>): string {
    const libraryIndex = this.libraries.findIndex(lib => lib.id === libraryId);
    if (libraryIndex === -1) return '';
    
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      front: cardData.front || '',
      back: cardData.back || '',
    };
    
    this.libraries[libraryIndex].cards.push(newCard);
    this.libraries[libraryIndex].updatedAt = new Date();
    
    this.saveData();
    return newCard.id;
  }
  
  // Update a card in a library
  public updateCard(libraryId: string, cardData: Partial<Flashcard>): void {
    if (!cardData.id) return;
    
    const libraryIndex = this.libraries.findIndex(lib => lib.id === libraryId);
    if (libraryIndex === -1) return;
    
    const cardIndex = this.libraries[libraryIndex].cards.findIndex(card => card.id === cardData.id);
    if (cardIndex === -1) return;
    
    this.libraries[libraryIndex].cards[cardIndex] = {
      ...this.libraries[libraryIndex].cards[cardIndex],
      ...cardData
    };
    
    this.libraries[libraryIndex].updatedAt = new Date();
    
    this.saveData();
  }
  
  // Delete a card from a library
  public deleteCard(libraryId: string, cardId: string): void {
    const libraryIndex = this.libraries.findIndex(lib => lib.id === libraryId);
    if (libraryIndex === -1) return;
    
    this.libraries[libraryIndex].cards = this.libraries[libraryIndex].cards.filter(card => card.id !== cardId);
    this.libraries[libraryIndex].updatedAt = new Date();
    
    this.saveData();
  }
  
  // GROUP OPERATIONS
  
  // Create a new group
  public createGroup(name: string): string {
    const newGroup: LibraryGroup = {
      id: `group-${Date.now()}`,
      name: name || 'New Group',
      libraries: []
    };
    
    this.groups.push(newGroup);
    this.saveData();
    
    return newGroup.id;
  }
  
  // Update a group
  public updateGroup(groupId: string, name: string): void {
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;
    
    this.groups[groupIndex].name = name;
    this.saveData();
  }
  
  // Delete a group
  public deleteGroup(groupId: string): void {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) return;
    
    // Move libraries from deleted group to ungrouped
    this.ungroupedLibraries = [...this.ungroupedLibraries, ...group.libraries];
    
    // Remove the group
    this.groups = this.groups.filter(g => g.id !== groupId);
    
    this.saveData();
  }
  
  // Add a library to a group
  public addLibraryToGroup(libraryId: string, groupId: string): void {
    // Find the group
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;
    
    // Check if library already in group
    if (this.groups[groupIndex].libraries.includes(libraryId)) return;
    
    // Add to group
    this.groups[groupIndex].libraries.push(libraryId);
    
    // Remove from ungrouped
    this.ungroupedLibraries = this.ungroupedLibraries.filter(id => id !== libraryId);
    
    // Remove from other groups
    for (let i = 0; i < this.groups.length; i++) {
      if (i !== groupIndex && this.groups[i].libraries.includes(libraryId)) {
        this.groups[i].libraries = this.groups[i].libraries.filter(id => id !== libraryId);
      }
    }
    
    this.saveData();
  }
  
  // Remove a library from a group
  public removeLibraryFromGroup(libraryId: string, groupId: string): void {
    // Find the group
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;
    
    // Remove from group
    this.groups[groupIndex].libraries = this.groups[groupIndex].libraries.filter(id => id !== libraryId);
    
    // Add to ungrouped
    if (!this.ungroupedLibraries.includes(libraryId)) {
      this.ungroupedLibraries.push(libraryId);
    }
    
    this.saveData();
  }
  
  // Handle library drag and drop between groups
  public moveLibrary(libraryId: string, targetGroupId?: string, sourceGroupId?: string): void {
    // Skip if source and target are the same
    if (sourceGroupId === targetGroupId) return;
    
    // Remove from source group
    if (sourceGroupId) {
      this.removeLibraryFromGroup(libraryId, sourceGroupId);
    } else {
      // Remove from ungrouped
      this.ungroupedLibraries = this.ungroupedLibraries.filter(id => id !== libraryId);
    }
    
    // Add to target group or to ungrouped
    if (targetGroupId) {
      const groupIndex = this.groups.findIndex(g => g.id === targetGroupId);
      if (groupIndex !== -1 && !this.groups[groupIndex].libraries.includes(libraryId)) {
        this.groups[groupIndex].libraries.push(libraryId);
      }
    } else {
      // Add to ungrouped
      if (!this.ungroupedLibraries.includes(libraryId)) {
        this.ungroupedLibraries.push(libraryId);
      }
    }
    
    this.saveData();
  }
  
  // STUDY SESSION OPERATIONS
  
  // Add a new study session
  public addStudySession(libraryId: string, results: {
    correct: number;
    total: number;
    score: number;
    studyMode: StudyMode;
    sessionType: SessionType;
    reps?: number;
  }): string {
    const library = this.getLibrary(libraryId);
    if (!library) return '';
    
    const now = new Date();
    const newSession: StudySessionResult = {
      id: `session-${Date.now()}`,
      libraryId,
      libraryName: library.name,
      startTime: now,
      endTime: now,
      studyMode: results.studyMode,
      sessionType: results.sessionType,
      correct: results.correct,
      total: results.total,
      score: results.score,
      reps: results.reps
    };
    
    this.studySessions.push(newSession);
    this.saveData();
    this.notifySubscribers();
    
    return newSession.id;
  }
}

// Create a singleton instance
const flashcardManager = new FlashcardManager();

// Type for our context
interface FlashcardContextType {
  // Core manager access
  manager: FlashcardManager;
  
  // Reactive state
  libraries: FlashcardLibrary[];
  groups: LibraryGroup[];
  ungroupedLibraries: string[];
  ungroupedLibraryObjects: FlashcardLibrary[];
  studySessions: StudySessionResult[];
  
  // Selected state
  selectedLibraryId: string | null;
  selectedLibrary: FlashcardLibrary | null;
  libraryStudySessions: StudySessionResult[];
  
  // UI state
  activeTab: string;
  showLibraryDialog: boolean;
  showCardDialog: boolean;
  showDeleteDialog: boolean;
  editingLibrary: FlashcardLibrary | null;
  editingCard: Flashcard | null;
  deletingItem: { type: 'library' | 'card' | 'group', item: any } | null;
  
  // Study mode state
  isStudyMode: boolean;
  showStudyResults: boolean;
  showStudyConfig: boolean;
  selectedStudyMode: StudyMode;
  selectedSessionType: SessionType;
  selectedReps: number;
  currentStudyResults: {
    correct: number;
    total: number;
    score: number;
  } | null;

  // Actions
  setActiveTab: (tab: string) => void;
  setSelectedLibraryId: (id: string | null) => void;
  
  // Dialog controls
  openLibraryDialog: (library?: FlashcardLibrary | null) => void;
  closeLibraryDialog: () => void;
  openCardDialog: (card?: Flashcard | null) => void;
  closeCardDialog: () => void;
  openDeleteDialog: (type: 'library' | 'card' | 'group', item: any) => void;
  closeDeleteDialog: () => void;
  
  // Study mode controls
  startStudyMode: (mode: StudyMode, sessionType: SessionType, reps: number) => void;
  exitStudyMode: () => void;
  finishStudySession: (results: { correct: number; total: number; score: number; studyMode: StudyMode; sessionType: SessionType }) => void;
  openStudyConfig: () => void;
  closeStudyConfig: () => void;
  
  // Operation handlers
  handleSaveLibrary: (libraryData: Partial<FlashcardLibrary>) => void;
  handleSaveCard: (cardData: Partial<Flashcard>) => void;
  handleSaveGroup: (groupId: string | null, name: string) => void;
  handleConfirmDelete: () => void;
}

// Create the context
const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

// Provider component
export const FlashcardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State that needs to be reactive in React, derived from the manager
  const [libraries, setLibraries] = useState<FlashcardLibrary[]>(flashcardManager.getLibraries());
  const [groups, setGroups] = useState<LibraryGroup[]>(flashcardManager.getGroups());
  const [ungroupedLibraries, setUngroupedLibraries] = useState<string[]>(flashcardManager.getUngroupedLibraries());
  const [studySessions, setStudySessions] = useState<StudySessionResult[]>(flashcardManager.getStudySessions());
  
  // Local state for selected library
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("cards");
  
  // UI state
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState<FlashcardLibrary | null>(null);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: 'library' | 'card' | 'group', item: any } | null>(null);
  
  // Study mode state
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [showStudyResults, setShowStudyResults] = useState(false);
  const [currentStudyResults, setCurrentStudyResults] = useState<{
    correct: number;
    total: number;
    score: number;
  } | null>(null);
  const [showStudyConfig, setShowStudyConfig] = useState(false);
  const [selectedStudyMode, setSelectedStudyMode] = useState<StudyMode>('flip');
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType>('infinite');
  const [selectedReps, setSelectedReps] = useState<number>(1);

  // Subscribe to manager changes to keep React state in sync
  useEffect(() => {
    const unsubscribe = flashcardManager.subscribe(() => {
      setLibraries(flashcardManager.getLibraries());
      setGroups(flashcardManager.getGroups());
      setUngroupedLibraries(flashcardManager.getUngroupedLibraries());
      setStudySessions(flashcardManager.getStudySessions());
    });
    
    return unsubscribe;
  }, []);

  // Computed values
  const selectedLibrary = selectedLibraryId ? flashcardManager.getLibrary(selectedLibraryId) : null;
  const libraryStudySessions = selectedLibraryId ? flashcardManager.getLibraryStudySessions(selectedLibraryId) : [];
  const ungroupedLibraryObjects = flashcardManager.getUngroupedLibraryObjects();

  // Set the first library as selected if none selected
  useEffect(() => {
    if (libraries.length > 0 && !selectedLibraryId) {
      setSelectedLibraryId(libraries[0].id);
    }
  }, [libraries, selectedLibraryId]);

  // Dialog controls
  const openLibraryDialog = (library: FlashcardLibrary | null = null) => {
    setEditingLibrary(library);
    setShowLibraryDialog(true);
  };

  const closeLibraryDialog = () => {
    setShowLibraryDialog(false);
    setEditingLibrary(null);
  };

  const openCardDialog = (card: Flashcard | null = null) => {
    setEditingCard(card);
    setShowCardDialog(true);
  };

  const closeCardDialog = () => {
    setShowCardDialog(false);
    setEditingCard(null);
  };

  const openDeleteDialog = (type: 'library' | 'card' | 'group', item: any) => {
    setDeletingItem({ type, item });
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingItem(null);
  };

  // Study mode controls
  const startStudyMode = (mode: StudyMode, sessionType: SessionType, reps: number) => {
    setSelectedStudyMode(mode);
    setSelectedSessionType(sessionType);
    setSelectedReps(reps);
    setIsStudyMode(true);
    setShowStudyConfig(false);
  };

  const exitStudyMode = () => {
    setIsStudyMode(false);
    setShowStudyResults(false);
    setShowStudyConfig(false);
  };

  const finishStudySession = (results: { correct: number; total: number; score: number; studyMode: StudyMode; sessionType: SessionType }) => {
    if (!selectedLibraryId) return;
    
    // Add the study session
    flashcardManager.addStudySession(selectedLibraryId, results);
    
    // Update the study sessions state to trigger a re-render
    setStudySessions(flashcardManager.getStudySessions());
    
    // Update UI state
    setCurrentStudyResults(results);
    setIsStudyMode(false);
    setShowStudyResults(true);
  };

  const openStudyConfig = () => {
    setShowStudyConfig(true);
  };

  const closeStudyConfig = () => {
    setShowStudyConfig(false);
  };

  // Main operation handlers
  const handleSaveLibrary = (libraryData: Partial<FlashcardLibrary>) => {
    if (editingLibrary) {
      flashcardManager.updateLibrary({
        ...libraryData,
        id: editingLibrary.id,
      });
    } else {
      const newLibraryId = flashcardManager.addLibrary(libraryData);
      setSelectedLibraryId(newLibraryId);
    }
    
    closeLibraryDialog();
  };

  const handleSaveCard = (cardData: Partial<Flashcard>) => {
    if (!selectedLibraryId) return;
    
    if (editingCard) {
      flashcardManager.updateCard(selectedLibraryId, {
        ...cardData,
        id: editingCard.id,
      });
    } else {
      flashcardManager.addCard(selectedLibraryId, cardData);
    }
    
    closeCardDialog();
  };
  
  const handleSaveGroup = (groupId: string | null, name: string) => {
    if (groupId) {
      flashcardManager.updateGroup(groupId, name);
    } else {
      flashcardManager.createGroup(name);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    
    if (deletingItem.type === 'library') {
      flashcardManager.deleteLibrary(deletingItem.item.id);
      
      if (selectedLibraryId === deletingItem.item.id) {
        setSelectedLibraryId(libraries.length > 1 ? libraries[0].id : null);
      }
    } else if (deletingItem.type === 'card' && selectedLibraryId) {
      flashcardManager.deleteCard(selectedLibraryId, deletingItem.item.id);
    } else if (deletingItem.type === 'group') {
      flashcardManager.deleteGroup(deletingItem.item.id);
    }
    
    closeDeleteDialog();
  };

  // Value object with all context data and functions
  const contextValue: FlashcardContextType = {
    // Core manager access
    manager: flashcardManager,
    
    // Reactive state
    libraries,
    groups,
    ungroupedLibraries,
    ungroupedLibraryObjects,
    studySessions,
    
    // Selected state
    selectedLibraryId,
    selectedLibrary,
    libraryStudySessions,
    
    // UI state
    activeTab,
    showLibraryDialog,
    showCardDialog,
    showDeleteDialog,
    editingLibrary,
    editingCard,
    deletingItem,
    
    // Study mode state
    isStudyMode,
    showStudyResults,
    showStudyConfig,
    selectedStudyMode,
    selectedSessionType,
    selectedReps,
    currentStudyResults,
    
    // Actions
    setActiveTab,
    setSelectedLibraryId,
    
    // Dialog controls
    openLibraryDialog,
    closeLibraryDialog,
    openCardDialog,
    closeCardDialog,
    openDeleteDialog,
    closeDeleteDialog,
    
    // Study mode controls
    startStudyMode,
    exitStudyMode,
    finishStudySession,
    openStudyConfig,
    closeStudyConfig,
    
    // Operation handlers
    handleSaveLibrary,
    handleSaveCard,
    handleSaveGroup,
    handleConfirmDelete,
  };

  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};

// Custom hook to use the context
export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
}; 