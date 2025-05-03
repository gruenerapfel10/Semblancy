import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/models';

// Schema for flashcards
const flashcardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe("The question or front side of the flashcard"),
      back: z.string().describe("The answer or back side of the flashcard")
    })
  ).min(1).max(20)
});

// Schema for request validation
const requestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  numCards: z.number().int().min(1).max(20).default(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    const { topic, numCards } = requestSchema.parse(body);
    
    return new Response(
      // Use createDataStreamResponse to stream the AI response
      new ReadableStream({
        async start(controller) {
          try {
            // Use streamObject to generate flashcards
            const { fullStream } = streamObject({
              model: myProvider.languageModel('flash'), // Using Gemini Flash model
              system: `You are a helpful AI assistant that creates educational flashcards. 
                      Generate ${numCards} high-quality flashcards on the topic provided.
                      Each flashcard should have a clear question on the front and a concise answer on the back.
                      For factual topics, ensure information is accurate.
                      For conceptual or theoretical topics, provide clear explanations.
                      Use appropriate formatting and make sure cards are suitable for learning.`,
              prompt: topic,
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
            console.error('Error generating flashcards:', error);
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ error: "Failed to generate flashcards" })}\n\n`
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