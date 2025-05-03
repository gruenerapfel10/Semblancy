"use client";

import React from "react";
import { FlashcardProvider } from "./components/FlashcardContext";
import FlashcardLayout from "./components/FlashcardLayout";

// Import flashcard styles
import "./styles.css";

export default function FlashcardsPage() {
  return (
    <FlashcardProvider>
      <FlashcardLayout />
    </FlashcardProvider>
  );
}
