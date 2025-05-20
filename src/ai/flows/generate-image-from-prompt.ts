
'use server';
/**
 * @fileOverview AI-powered image generator from a text prompt.
 *
 * - generateImageFromPrompt - A function that generates an image based on a textual prompt.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromPromptInputSchema = z.object({
  prompt: z.string().describe('A detailed textual prompt to generate an image from.'),
});
export type GenerateImageFromPromptInput = z.infer<typeof GenerateImageFromPromptInputSchema>;

const GenerateImageFromPromptOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI, including MIME type and Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
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
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Explicitly use the image generation capable model
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must include TEXT and IMAGE
        // You might want to add safetySettings here if needed, e.g.:
        // safetySettings: [{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' }]
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or returned no image data.');
    }
    
    // The model might return TEXT output as well, but we only care about the image URL.
    // The URL should be a data URI like "data:image/png;base64,..."
    return { imageDataUri: media.url };
  }
);
