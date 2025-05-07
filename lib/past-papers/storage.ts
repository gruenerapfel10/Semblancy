/**
 * Storage utilities for past papers
 */
import { SerializedPaper, UploadedPaper } from './types';

const STORAGE_KEY = 'semblancy-past-papers';

/**
 * Convert a File object to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract the base64 part only (remove prefix)
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert a base64 string to a File object
 */
export const base64ToFile = (
  base64: string,
  fileName: string,
  type: string,
  lastModified: number
): File => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new File([bytes.buffer], fileName, { type, lastModified });
};

/**
 * Serialize a paper for storage
 */
export const serializePaper = async (paper: UploadedPaper): Promise<SerializedPaper> => {
  const fileData = await fileToBase64(paper.file);
  return {
    id: paper.id,
    fileName: paper.file.name,
    fileType: paper.file.type,
    fileSize: paper.file.size,
    lastModified: paper.file.lastModified,
    fileData,
    year: paper.year,
    subject: paper.subject,
    paper: paper.paper,
    type: paper.type,
    season: paper.season,
    createdAt: paper.createdAt,
    updatedAt: paper.updatedAt,
  };
};

/**
 * Deserialize a paper from storage
 */
export const deserializePaper = (serialized: SerializedPaper): UploadedPaper => {
  const file = base64ToFile(
    serialized.fileData,
    serialized.fileName,
    serialized.fileType,
    serialized.lastModified
  );
  
  return {
    id: serialized.id,
    file,
    year: serialized.year,
    subject: serialized.subject,
    paper: serialized.paper,
    type: serialized.type,
    season: serialized.season,
    createdAt: serialized.createdAt,
    updatedAt: serialized.updatedAt,
  };
};

/**
 * Get all papers from storage
 */
export const getAllPapers = (): SerializedPaper[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error getting papers from storage:', error);
    return [];
  }
};

/**
 * Save all papers to storage
 */
export const savePapers = (papers: SerializedPaper[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
  } catch (error) {
    console.error('Error saving papers to storage:', error);
  }
};

/**
 * Get a single paper by ID
 */
export const getPaperById = (id: string): SerializedPaper | undefined => {
  const papers = getAllPapers();
  return papers.find(paper => paper.id === id);
};

/**
 * Add a new paper to storage
 */
export const addPaper = async (paper: UploadedPaper): Promise<void> => {
  const papers = getAllPapers();
  const serialized = await serializePaper(paper);
  
  papers.push(serialized);
  savePapers(papers);
};

/**
 * Update a paper in storage
 */
export const updatePaper = async (paper: UploadedPaper): Promise<void> => {
  const papers = getAllPapers();
  const index = papers.findIndex(p => p.id === paper.id);
  
  if (index !== -1) {
    const serialized = await serializePaper(paper);
    papers[index] = serialized;
    savePapers(papers);
  }
};

/**
 * Delete a paper from storage
 */
export const deletePaper = (id: string): void => {
  const papers = getAllPapers();
  const filtered = papers.filter(paper => paper.id !== id);
  
  savePapers(filtered);
};

/**
 * Clear all papers from storage
 */
export const clearAllPapers = (): void => {
  savePapers([]);
}; 