/**
 * Types for the past-papers module
 */

/**
 * Represents an uploaded past paper
 */
export interface UploadedPaper {
  id: string;
  file: File;
  year: string;
  subject: string;
  paper: string;
  type: string;
  season: string;
  createdAt: number; // Timestamp of creation
  updatedAt: number; // Timestamp of last update
}

/**
 * Serialized version of UploadedPaper for storage
 * (File objects can't be stored directly in localStorage)
 */
export interface SerializedPaper {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  lastModified: number;
  // File content as base64 string
  fileData: string;
  year: string;
  subject: string;
  paper: string;
  type: string;
  season: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Paper filter options
 */
export interface PaperFilter {
  searchTerm?: string;
  subject?: string;
  year?: string;
} 