
'use server';
/**
 * @fileOverview AI-powered image generator from a text prompt, with support for image editing.
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
  imageDataUri: z
    .string()
    .describe(
      "The generated or edited image as a data URI, including MIME type and Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateImageFromPromptOutput = z.infer<typeof GenerateImageFromPromptOutputSchema>;

export async function generateImageFromPrompt(
  input: GenerateImageFromPromptInput
): Promise<GenerateImageFromPromptOutput> {
  return generateImageFromPromptFlow(input);
}

const generateImageFromPromptFlow = ai.defineFlow(
  {
    name: 'generateImageFromPromptFlow',
    inputSchema: GenerateImageFromPromptInputSchema,
    outputSchema: GenerateImageFromPromptOutputSchema,
  },
  async (input: GenerateImageFromPromptInput) => {
    let generationPrompt: string | Array<{text?: string; media?: {url: string}}>

    if (input.baseImageDataUri && input.editInstruction) {
      // Editing an existing image
      generationPrompt = [
        { media: { url: input.baseImageDataUri } },
        { text: input.editInstruction },
      ];
    } else if (input.prompt) {
      // Initial image generation
      generationPrompt = input.prompt;
    } else {
      throw new Error('Either a prompt for initial generation or a base image and edit instruction must be provided.');
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Explicitly use the image generation capable model
      prompt: generationPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must include TEXT and IMAGE
        // You might want to add safetySettings here if needed, e.g.:
        // safetySettings: [{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' }]
      },
    });

    if (!media?.url) {
      throw new Error('Image generation/editing failed or returned no image data.');
    }
    
    return { imageDataUri: media.url };
  }
);
