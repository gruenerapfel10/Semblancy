export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  libraryId: string;
  tags: string[];
  isFavorite?: boolean;
}

export interface NoteLibrary {
  id: string;
  name: string;
  color: string;
} 