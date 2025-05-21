
'use server';
/**
 * @fileOverview AI-powered image generator from a text prompt, with support for image editing.
 * It generates a single image for initial creation or editing.
 *
 * - generateImageFromPrompt - A function that generates an image based on a textual prompt, or edits an existing image based on instructions.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromPromptInputSchema = z.object({
  prompt: z.string().optional().describe('A detailed textual prompt to generate an image from (used for initial generation).'),
  baseImageDataUri: z.string().optional().describe("The base image as a data URI to be edited. Expected format: 'data:image/png;base64,<encoded_data>'."),
  editInstruction: z.string().optional().describe('Textual instruction on how to edit the base image (e.g., "change background to blue", "add a hat to the person").'),
});
export type GenerateImageFromPromptInput = z.infer<typeof GenerateImageFromPromptInputSchema>;

const GenerateImageFromPromptOutputSchema = z.object({
  imageDataUris: z
    .array(z.string())
    .length(1) // Ensures the array always contains exactly one image URI
    .describe(
      "An array containing a single generated or edited image as a data URI, including MIME type and Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateImageFromPromptOutput = z.infer<typeof GenerateImageFromPromptOutputSchema>;

export async function generateImageFromPrompt(
  input: GenerateImageFromPromptInput
): Promise<GenerateImageFromPromptOutput> {
  return generateImageFromPromptFlow(input);
}

const generateSingleImage = async (
    prompt: string | Array<{text?: string; media?: {url: string}}>,
    retryCount = 0
  ): Promise<string | null> => {
  try {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        // safetySettings: [{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }] 
      },
    });
    return media?.url || null;
  } catch (error) {
    console.error('Error generating single image:', error);
    if (retryCount < 1) { // Retry once
      console.log('Retrying image generation...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec before retry
      return generateSingleImage(prompt, retryCount + 1);
    }
    return null; // Return null if generation fails after retries
  }
};


const generateImageFromPromptFlow = ai.defineFlow(
  {
    name: 'generateImageFromPromptFlow',
    inputSchema: GenerateImageFromPromptInputSchema,
    outputSchema: GenerateImageFromPromptOutputSchema,
  },
  async (input: GenerateImageFromPromptInput) => {
    const generatedUris: string[] = [];
    let imageUri: string | null = null;

    if (input.baseImageDataUri && input.editInstruction) {
      // Editing an existing image - generate one edited version
      const editPromptPayload = [
        { media: { url: input.baseImageDataUri } },
        { text: input.editInstruction },
      ];
      imageUri = await generateSingleImage(editPromptPayload);
    } else if (input.prompt) {
      // Initial image generation - generate one image
      imageUri = await generateSingleImage(input.prompt);
    } else {
      throw new Error('Either a prompt for initial generation or a base image and edit instruction must be provided.');
    }

    if (imageUri) {
      generatedUris.push(imageUri);
    } else {
       throw new Error('Image generation/editing failed to produce an image.');
    }
    
    return { imageDataUris: generatedUris };
  }
);
