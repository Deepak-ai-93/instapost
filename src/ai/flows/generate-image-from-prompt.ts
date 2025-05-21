
'use server';
/**
 * @fileOverview AI-powered image generator from a text prompt, with support for image editing and logo incorporation.
 * It generates a single image for initial creation or editing.
 *
 * - generateImageFromPrompt - A function that generates an image based on a textual prompt, or edits an existing image based on instructions.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromPromptInputSchema = z.object({
  prompt: z.string().optional().describe('A detailed textual prompt to generate an image from (used for initial generation). This prompt should guide the overall image and instruct on how to incorporate the logo if one is provided via URL.'),
  baseImageDataUri: z.string().optional().describe("The base image as a data URI to be edited. Expected format: 'data:image/png;base64,<encoded_data>'."),
  editInstruction: z.string().optional().describe('Textual instruction on how to edit the base image (e.g., "change background to blue", "add a hat to the person"). This may also include instructions regarding an optional logo URL.'),
  logoImageUrl: z.string().optional().describe("Optional: The user's logo as a public image URL to attempt to incorporate into the generated/edited image."),
});
export type GenerateImageFromPromptInput = z.infer<typeof GenerateImageFromPromptInputSchema>;

const GenerateImageFromPromptOutputSchema = z.object({
  imageDataUris: z
    .array(z.string())
    .length(1) 
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

const generateSingleImageWithOptionalLogo = async (
    promptPayload: Array<{text?: string; media?: {url: string}}>,
    retryCount = 0
  ): Promise<string | null> => {
  try {
    // console.log("Generating image with payload:", JSON.stringify(promptPayload, null, 2));
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: promptPayload,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        // safetySettings: [{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }] 
      },
    });
    return media?.url || null;
  } catch (error) {
    console.error('Error generating single image:', error);
    if (retryCount < 1) { 
      console.log('Retrying image generation...');
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      return generateSingleImageWithOptionalLogo(promptPayload, retryCount + 1);
    }
    return null; 
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

    const promptPayload: Array<{text?: string; media?: {url: string}}> = [];

    // Add logo URL first if provided, so it's part of the context for the main image/edit
    if (input.logoImageUrl) {
      // Basic validation for URL structure
      try {
        new URL(input.logoImageUrl); // Check if it's a valid URL format
        promptPayload.push({ media: { url: input.logoImageUrl } });
      } catch (e) {
        console.warn("Invalid logoImageUrl provided, skipping:", input.logoImageUrl, e);
        // Optionally, we could throw an error or notify the user
      }
    }

    if (input.baseImageDataUri && input.editInstruction) {
      // Editing an existing image
      promptPayload.push({ media: { url: input.baseImageDataUri } });
      promptPayload.push({ text: input.editInstruction }); // Edit instruction should also guide logo placement if logoImageUrl is present
      imageUri = await generateSingleImageWithOptionalLogo(promptPayload);
    } else if (input.prompt) {
      // Initial image generation
      // The main textual prompt already has instructions on how to handle the logo URL.
      // The logoImageUrl (if any) is already added to promptPayload above.
      promptPayload.push({ text: input.prompt }); 
      imageUri = await generateSingleImageWithOptionalLogo(promptPayload);
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

    
