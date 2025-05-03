import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/models';

// Schema for response validation
const markingResponseSchema = z.object({
  isCorrect: z.boolean().describe("Whether the answer is correct or not"),
  score: z.number().min(0).max(100).describe("Score as a percentage"),
  feedback: z.string().describe("Constructive feedback on the answer"),
  explanation: z.string().optional().describe("Explanation of the correct answer if needed")
});

// Schema for request validation
const requestSchema = z.object({
  userAnswer: z.string().min(1, "User answer is required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  question: z.string().min(1, "Question is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    const { userAnswer, correctAnswer, question } = requestSchema.parse(body);
    
    return new Response(
      // Use ReadableStream to stream the AI response
      new ReadableStream({
        async start(controller) {
          try {
            // Use streamObject to generate marking feedback
            const { fullStream } = streamObject({
              model: myProvider.languageModel('flash'), // Using Gemini Flash model
              system: `You are an educational AI assistant that evaluates flashcard answers.
                      Compare the user's answer to the correct answer and determine if it's correct.
                      Consider semantic similarity, not just exact matching.
                      Provide a score (0-100) and helpful, encouraging feedback.
                      Be lenient with minor spelling mistakes or alternate phrasings that convey the same meaning.
                      For partially correct answers, explain what was missing or incorrect.`,
              prompt: `Question: ${question}\nUser Answer: ${userAnswer}\nCorrect Answer: ${correctAnswer}`,
              schema: markingResponseSchema,
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
            console.error('Error marking answer:', error);
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ error: "Failed to mark answer" })}\n\n`
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