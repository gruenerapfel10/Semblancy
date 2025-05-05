import { Flashcard, MarkingResponse } from './components/types';

// Type for marking response is now imported from types.ts
/**
 * Streams AI feedback for a flashcard answer
 */
export async function streamMarkAnswer(
  userAnswer: string,
  correctAnswer: string,
  question: string,
  onMarkingUpdate: (data: MarkingResponse) => void,
  isFlipped: boolean = false
) {
  try {
    const response = await fetch('/api/flashcards/mark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAnswer,
        correctAnswer,
        question,
        isFlipped
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark answer');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is null');

    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          
          try {
            const parsedData = JSON.parse(data);
            onMarkingUpdate(parsedData);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming marking:', error);
    throw error;
  }
} 