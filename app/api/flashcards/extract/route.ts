import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/models';

// Schema for flashcards extracted from documents
const flashcardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe("The question or front side of the flashcard"),
      back: z.string().describe("The answer or back side of the flashcard")
    })
  ).min(1).max(50)
});

// Schema for request validation
const requestSchema = z.object({
  fileUrl: z.string().url("Valid file URL is required"),
  fileName: z.string().optional(),
  maxCards: z.number().int().min(1).max(50).default(20),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    const { fileUrl, fileName, maxCards } = requestSchema.parse(body);
    
    // In a real implementation, we would:
    // 1. Download the PDF from fileUrl
    // 2. Extract text content using a library like pdf-parse
    // 3. Send the extracted text to the AI model
    
    // For this implementation, we'll simulate text extraction and send a prompt
    // to the AI model indicating we're working with a PDF
    
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            // Use streamObject to generate flashcards from the "extracted" PDF content
            const { fullStream } = streamObject({
              model: myProvider.languageModel('flash'), // Using Gemini Flash model
              system: `You are an AI assistant that specializes in creating educational flashcards from documents.
                      Imagine you've been given a PDF file named "${fileName || 'document.pdf'}" to analyze.
                      Extract up to ${maxCards} high-quality flashcards from the document content.
                      Each flashcard should have a clear question on the front and a concise answer on the back.
                      Focus on the most important concepts, facts, and definitions from the document.
                      Ensure the cards cover a variety of topics from the document and are suitable for learning.`,
              prompt: `Extract flashcards from the file "${fileName || 'document.pdf'}" using the most important information.`,
              schema: flashcardSchema,
            });

            for await (const delta of fullStream) {
              if (delta.type === 'object') {
                // Send the data as a properly formatted JSON chunk
                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify(delta.object)}\n\n`
                  )
                );
              }
            }
            
            // Signal the end of the stream
            controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (error) {
            console.error('Error extracting flashcards:', error);
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ error: "Failed to extract flashcards from document" })}\n\n`
              )
            );
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 400 }
    );
  }
} 