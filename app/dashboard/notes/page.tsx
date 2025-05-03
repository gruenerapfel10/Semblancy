import React from 'react';
import { Metadata } from 'next';
import { NotesContainer } from './components/NotesContainer';

export const metadata: Metadata = {
  title: 'Notes | Semblancy',
  description: 'Organize and manage your study notes',
};

export default function NotesPage() {
  return <NotesContainer />;
}
