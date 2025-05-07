/**
 * React hooks for past papers management
 */
import { useState, useEffect, useCallback } from 'react';
import { UploadedPaper, PaperFilter, SerializedPaper } from './types';
import {
  getAllPapers,
  addPaper,
  updatePaper,
  deletePaper as deleteStoredPaper,
  clearAllPapers as clearStorage,
  deserializePaper
} from './storage';
import {
  createPaperFromFile,
  filterPapers,
  getUniqueValues,
  sortPapers
} from './utils';

/**
 * Hook for managing past papers with localStorage persistence
 */
export const usePastPapers = () => {
  const [papers, setPapers] = useState<UploadedPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load all papers from localStorage on mount
  useEffect(() => {
    const loadPapers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get serialized papers from storage
        const serializedPapers = getAllPapers();
        
        // Deserialize papers (convert from storage format to usable objects)
        const loadedPapers = serializedPapers.map(deserializePaper);
        
        // Sort by creation date (newest first)
        const sortedPapers = sortPapers(loadedPapers, 'createdAt', 'desc');
        
        setPapers(sortedPapers);
      } catch (err) {
        console.error('Error loading papers:', err);
        setError(err instanceof Error ? err : new Error('Failed to load papers'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPapers();
  }, []);

  /**
   * Add one or more files as papers
   */
  const addPapers = useCallback(async (files: File[]): Promise<UploadedPaper[]> => {
    try {
      // Create paper objects from files
      const newPapers = files.map(createPaperFromFile);
      
      // Save each paper to storage
      await Promise.all(newPapers.map(paper => addPaper(paper)));
      
      // Update state
      setPapers(prev => sortPapers([...prev, ...newPapers], 'createdAt', 'desc'));
      
      return newPapers;
    } catch (err) {
      console.error('Error adding papers:', err);
      setError(err instanceof Error ? err : new Error('Failed to add papers'));
      return [];
    }
  }, []);

  /**
   * Delete a paper by ID
   */
  const deletePaper = useCallback((paper: UploadedPaper) => {
    try {
      if (!paper.id) return;
      
      // Delete from storage
      deleteStoredPaper(paper.id);
      
      // Update state
      setPapers(prev => prev.filter(p => p.id !== paper.id));
    } catch (err) {
      console.error('Error deleting paper:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete paper'));
    }
  }, []);

  /**
   * Update a paper's metadata
   */
  const updatePaperMetadata = useCallback(async (id: string, metadata: Partial<UploadedPaper>) => {
    try {
      const paperIndex = papers.findIndex(p => p.id === id);
      if (paperIndex === -1) return;
      
      const updatedPaper = {
        ...papers[paperIndex],
        ...metadata,
        updatedAt: Date.now()
      };
      
      // Update in storage
      await updatePaper(updatedPaper);
      
      // Update state
      setPapers(prev => {
        const updated = [...prev];
        updated[paperIndex] = updatedPaper;
        return updated;
      });
    } catch (err) {
      console.error('Error updating paper:', err);
      setError(err instanceof Error ? err : new Error('Failed to update paper'));
    }
  }, [papers]);

  /**
   * Clear all papers
   */
  const clearAllPapers = useCallback(() => {
    try {
      // Clear storage
      clearStorage();
      
      // Update state
      setPapers([]);
    } catch (err) {
      console.error('Error clearing papers:', err);
      setError(err instanceof Error ? err : new Error('Failed to clear papers'));
    }
  }, []);

  /**
   * Filter papers based on criteria
   */
  const getPapers = useCallback((filter?: PaperFilter) => {
    if (!filter) return papers;
    return filterPapers(papers, filter);
  }, [papers]);

  /**
   * Get unique values for a field
   */
  const getFieldValues = useCallback(<T extends keyof UploadedPaper>(field: T): Array<UploadedPaper[T]> => {
    return getUniqueValues(papers, field);
  }, [papers]);

  /**
   * Get a paper by ID
   */
  const getPaperById = useCallback((id: string): UploadedPaper | undefined => {
    return papers.find(p => p.id === id);
  }, [papers]);

  return {
    papers,
    isLoading,
    error,
    addPapers,
    deletePaper,
    updatePaperMetadata,
    clearAllPapers,
    getPapers,
    getFieldValues,
    getPaperById
  };
}; 