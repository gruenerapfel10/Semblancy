/**
 * Utility functions for past papers
 */
import { UploadedPaper, PaperFilter } from './types';

/**
 * Generate a unique ID for a paper
 */
export const generatePaperId = (): string => {
  return 'paper_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Extract metadata from a file name
 * Assumes filename format: YYYY_Subject_Paper_Type_Season.pdf
 */
export const extractMetadataFromFilename = (fileName: string): Partial<UploadedPaper> => {
  // Remove extension and split by underscore
  const parts = fileName.replace(/\.[^/.]+$/, '').split('_');
  
  return {
    year: parts[0] || '2024',
    subject: parts[1] || 'Mathematics',
    paper: parts[2] || 'Paper 1',
    type: parts[3] || 'Question Paper',
    season: parts[4] || 'Summer',
  };
};

/**
 * Create a new paper object from a file
 */
export const createPaperFromFile = (file: File): UploadedPaper => {
  const metadata = extractMetadataFromFilename(file.name);
  const now = Date.now();
  
  return {
    id: generatePaperId(),
    file,
    year: metadata.year || '2024',
    subject: metadata.subject || 'Mathematics',
    paper: metadata.paper || 'Paper 1',
    type: metadata.type || 'Question Paper',
    season: metadata.season || 'Summer',
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Filter papers based on search criteria
 */
export const filterPapers = (papers: UploadedPaper[], filter: PaperFilter): UploadedPaper[] => {
  return papers.filter(paper => {
    const matchesSearch = !filter.searchTerm || filter.searchTerm === '' || 
      Object.entries(paper).some(([key, value]) => {
        // Skip file object and timestamps in search
        if (key === 'file' || key === 'createdAt' || key === 'updatedAt') return false;
        
        // Check if the value contains the search term (case-insensitive)
        if (typeof value === 'string' && filter.searchTerm) {
          return value.toLowerCase().includes(filter.searchTerm.toLowerCase());
        }
        return false;
      });
    
    const matchesSubject = !filter.subject || filter.subject === 'all' || 
      paper.subject === filter.subject;
    
    const matchesYear = !filter.year || filter.year === 'all' || 
      paper.year === filter.year;
    
    return matchesSearch && matchesSubject && matchesYear;
  });
};

/**
 * Get unique values for a specific field from a list of papers
 */
export const getUniqueValues = <T extends keyof UploadedPaper>(
  papers: UploadedPaper[],
  field: T
): Array<UploadedPaper[T]> => {
  const values = papers.map(paper => paper[field]);
  return [...new Set(values)];
};

/**
 * Sort papers by a specific field
 */
export const sortPapers = <T extends keyof UploadedPaper>(
  papers: UploadedPaper[],
  field: T,
  direction: 'asc' | 'desc' = 'desc'
): UploadedPaper[] => {
  return [...papers].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
    
    return 0;
  });
}; 