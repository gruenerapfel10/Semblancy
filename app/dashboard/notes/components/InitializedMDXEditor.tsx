'use client';

import { type ForwardedRef, useEffect, useState } from 'react';
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  tablePlugin,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
  frontmatterPlugin,
  toolbarPlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  UndoRedo,
} from '@mdxeditor/editor';
import { useTheme } from 'next-themes';
import 'katex/dist/katex.min.css';

// Following the official MDXEditor docs for Next.js App Router
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> } & MDXEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  // Force re-render when theme changes to ensure styles are applied
  const [, forceRender] = useState({});
  useEffect(() => {
    // This forces a re-render when theme changes
    forceRender({});
    
    // Apply dark mode class to document root for better CSS targeting
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode-enabled');
    } else {
      document.documentElement.classList.remove('dark-mode-enabled');
    }
  }, [resolvedTheme, isDarkMode]);

  // We initialize the editor with all our plugins
  return (
    <MDXEditor
      ref={editorRef}
      className={`w-full h-full mdxeditor-root ${isDarkMode ? 'mdx-editor-dark' : ''}`}
      contentEditableClassName="prose prose-lg dark:prose-invert max-w-none px-6 py-4 h-full focus:outline-none"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        codeBlockPlugin({
          defaultCodeBlockLanguage: 'javascript',
        }),
        tablePlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        frontmatterPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <Separator />
              <ListsToggle />
              <Separator />
              <CreateLink />
              <InsertImage />
              <Separator />
              <InsertTable />
              <InsertThematicBreak />
            </>
          )
        }),
      ]}
      {...props}
    />
  );
} 