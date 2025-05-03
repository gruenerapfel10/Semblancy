"use client";

import React from 'react';
import { useFlashcards } from './FlashcardContext';
import FlashcardSidebar from './FlashcardSidebar';
import FlashcardLibraryDialog from './FlashcardLibraryDialog';
import FlashcardCardDialog from './FlashcardCardDialog';
import FlashcardDeleteDialog from './FlashcardDeleteDialog';
import FlashcardStudyMode from './FlashcardStudyMode';
import FlashcardStudyResults from './FlashcardStudyResults';
import FlashcardStudyConfig from './FlashcardStudyConfig';
import FlashcardDashboard from './FlashcardDashboard';

const FlashcardLayout: React.FC = () => {
  const {
    selectedLibrary,
    libraryStudySessions,
    showLibraryDialog,
    showCardDialog,
    showDeleteDialog,
    editingLibrary,
    editingCard,
    deletingItem,
    selectedLibraryId,
    isStudyMode,
    showStudyResults,
    showStudyConfig,
    selectedStudyMode,
    currentStudyResults,
    libraries,
    setSelectedLibraryId,
    setActiveTab,
    handleSaveLibrary,
    handleSaveCard,
    handleConfirmDelete,
    exitStudyMode,
    finishStudySession,
    startStudyMode,
    openLibraryDialog,
    closeLibraryDialog,
    closeCardDialog,
    closeDeleteDialog,
    selectedSessionType,
    selectedReps
  } = useFlashcards();

  // If in study mode
  if (isStudyMode && selectedLibrary) {
    return (
      <FlashcardStudyMode
        library={selectedLibrary}
        studyMode={selectedStudyMode}
        sessionType={selectedSessionType}
        reps={selectedReps}
        onFinish={finishStudySession}
        onExit={exitStudyMode}
      />
    );
  }
  
  // If showing study config
  if (showStudyConfig && selectedLibrary) {
    return (
      <FlashcardStudyConfig
        library={selectedLibrary}
        onStart={startStudyMode}
        onCancel={exitStudyMode}
      />
    );
  }

  // If showing study results
  if (showStudyResults && selectedLibrary && currentStudyResults) {
    return (
      <FlashcardStudyResults
        session={currentStudyResults}
        libraryName={selectedLibrary.name}
        onRestart={() => startStudyMode(selectedStudyMode, selectedSessionType, selectedReps)}
        onExit={exitStudyMode}
        previousSessions={libraryStudySessions}
      />
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <FlashcardSidebar
        libraries={libraries}
        selectedLibraryId={selectedLibraryId}
        onSelectLibrary={(id) => {
          setSelectedLibraryId(id);
          setActiveTab("cards");
        }}
        onNewLibrary={() => {
          openLibraryDialog(null);
        }}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <FlashcardDashboard />
      </main>

      {/* Dialogs */}
      <FlashcardLibraryDialog
        open={showLibraryDialog}
        onOpenChange={(open) => {
          if (!open) {
            closeLibraryDialog();
          }
        }}
        library={editingLibrary}
        onSave={handleSaveLibrary}
      />

      {selectedLibraryId && (
        <FlashcardCardDialog
          open={showCardDialog}
          onOpenChange={(open) => {
            if (!open) {
              closeCardDialog();
            }
          }}
          card={editingCard}
          onSave={handleSaveCard}
          libraryId={selectedLibraryId}
        />
      )}

      <FlashcardDeleteDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deletingItem?.type === 'library' ? 'Library' : 'Card'}`}
        description={`Are you sure you want to delete this ${deletingItem?.type === 'library' ? 'library' : 'card'}? This action cannot be undone.`}
      />
    </div>
  );
};

export default FlashcardLayout; 