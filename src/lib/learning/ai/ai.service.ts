import { z } from 'zod';
import { createGoogleGenerativeAI } from '@ai-sdk/google'; // Vercel AI SDK import
import { generateText, GenerateTextResult, generateObject, NoObjectGeneratedError } from 'ai'; // Use generateText and import generateObject and error type
import { jsonrepair } from 'jsonrepair'; // Import jsonrepair
import { isDebugMode } from '@/lib/utils/debug';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import { QuestionSchema, GeneratedQuestion } from '@/lib/skillsRegistry/types'; // Import only single Question schema

const DEBUG_AI_SERVICE = isDebugMode('AI_SERVICE');
const MAX_RETRIES = 2; // Increase retries slightly for single generation

/**
 * Service responsible for AI interactions using the Vercel AI SDK.
 * Provides an abstraction layer over specific AI providers (currently Google Gemini).
 */
export class AIService {
  // Use the Vercel AI SDK Google provider factory
  private google;
  // Stick to 1.5 flash for now, supports generateObject well
  private readonly generationModelName = 'models/gemini-2.0-flash-001'; // Use a known valid model

  constructor() {
    const apiKey = "AIzaSyA5nwyjrCfkPx31yfp5AQFMUqIBNJnamGs";
    if (!apiKey) {
      console.warn("GOOGLE_API_KEY not found... AI Service will likely fail.");
      this.google = createGoogleGenerativeAI({ apiKey: 'MISSING_API_KEY' });
    } else {
      this.google = createGoogleGenerativeAI({ apiKey: apiKey });
    }
  }

  /**
   * Generates a single question based on a prompt and Zod schema.
   *
   * @param generationPrompt Prompt describing the single question to generate.
   * @param questionSchema The Zod schema for the desired question type (e.g., MultipleChoiceQuestionSchema).
   * @returns A validated question object, or null if generation fails.
   */
  async generateSingleQuestion(
    generationPrompt: string,
    questionSchema: z.ZodType<any, any> // Schema for ONE question
  ): Promise<GeneratedQuestion | null> {

    const model = this.google(this.generationModelName);
    const finalPrompt = `${generationPrompt}

IMPORTANT: Generate exactly one question that strictly adheres to the provided schema structure. Ensure all required fields are present and constraints are met.`;

    if (DEBUG_AI_SERVICE) {
      console.log(`[AI Service] Generating single question for schema: ${questionSchema.description || 'Unnamed Schema'}`);
      console.log(`[AI Service] Using prompt (start): "${finalPrompt.substring(0, 200)}..."`);
    }

    console.log("\n===========================================================");
    console.log(`[AI Service] FINAL PROMPT Sent to AI for Single Question Generation`);
    console.log("-----------------------------------------------------------");
    console.log(finalPrompt);
    console.log("===========================================================\n");

    let attempts = 0;
    while (attempts <= MAX_RETRIES) {
      try {
        if (DEBUG_AI_SERVICE && attempts > 0) {
           console.log(`[AI Service] Retrying single question generation (Attempt ${attempts + 1}/${MAX_RETRIES + 1})`);
         }

        // Use generateObject with the single question schema
        const { object: generatedQuestion } = await generateObject({
          model: model,
          schema: questionSchema, // Use the schema for the SINGLE question
          prompt: finalPrompt,
          temperature: 0.75, // Slightly higher temp might be okay for single questions
        });

        console.log("\n===========================================================");
        console.log(`[AI Service] RAW Validated Output from generateObject (Attempt ${attempts + 1}):`);
        console.log(JSON.stringify(generatedQuestion, null, 2));
        console.log("===========================================================\n");

        if (!generatedQuestion) {
            throw new Error("generateObject returned undefined/null despite success status.");
        }

        // Assign a unique ID, ALWAYS overwriting any ID from the AI
        const questionWithId = {
            ...generatedQuestion,
            id: uuidv4() // Force UUID generation
        };

        if (DEBUG_AI_SERVICE) {
             console.log(`[AI Service] Successfully generated and validated single question (Attempt ${attempts + 1}).`);
        }

        // Ensure the return type matches GeneratedQuestion (which is the union type)
        return questionWithId as GeneratedQuestion;

      } catch (error: any) {
        console.error(`[AI Service] Error generating/validating single question (Attempt ${attempts + 1}):`, error);
        if (NoObjectGeneratedError.isInstance(error)) {
            console.error(`[AI Service] NoObjectGeneratedError Details: Cause: ${error.cause}, Text: ${error.text}`);
        }
        attempts++;
        if (attempts > MAX_RETRIES) {
             console.error(`[AI Service] Failed to generate valid single question after ${attempts} attempts.`);
             return null;
        }
      }
    }
    return null; // Should be unreachable
  }

  // Deprecate or remove the old batch generation method
  async generateQuestions(/*...*/) {
      console.error("DEPRECATED: aiService.generateQuestions called. Use generateSingleQuestion instead.");
      return null;
  }

  // Deprecate or remove the old generateStructuredData method
  async generateStructuredData<T extends z.ZodType<any, any>>(
      prompt: string,
      zodSchema: T,
      schemaName: string
  ): Promise<z.infer<T> | null> {
      console.warn("[AI Service] Called deprecated generateStructuredData method.");
      return null;
  }
}

// Create a singleton instance
export const aiService = new AIService();
console.log("DEBUG: ai.service.ts loaded (using Vercel AI SDK) - REVERTED"); // Added REVERTED note 