'use client';

import dynamic from 'next/dynamic';
import { forwardRef } from 'react';
import { type MDXEditorMethods, type MDXEditorProps } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

// This is the only place InitializedMDXEditor is imported directly.
// We use dynamic import to prevent SSR issues
const Editor = dynamic(() => import('./InitializedMDXEditor'), {
  // Make sure we turn SSR off
  ssr: false
});

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
export const MDXNoteEditor = forwardRef<MDXEditorMethods, MDXEditorProps>((props, ref) => (
  <Editor {...props} editorRef={ref} />
));

// TS complains without the following line
MDXNoteEditor.displayName = 'MDXNoteEditor'; 