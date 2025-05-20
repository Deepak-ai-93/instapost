
'use server';

/**
 * @fileOverview AI-powered Instagram post details generator.
 *
 * - generatePostDetails - A function that generates various details for an Instagram post.
 * - GeneratePostDetailsInput - The input type for the generatePostDetails function.
 * - GeneratePostDetailsOutput - The return type for the generatePostDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePostDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate details for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userNiche: z.string().optional().describe('The user-provided niche or category for the post.'),
});
export type GeneratePostDetailsInput = z.infer<typeof GeneratePostDetailsInputSchema>;

const GeneratePostDetailsOutputSchema = z.object({
  engagingCaption: z.string().describe('An engaging and relevant caption for the image, suitable for a general audience.'),
  professionalCaption: z.string().describe('A more formal or professional version of the caption.'),
  hashtags: z.string().describe('A comma-separated list of 3-5 relevant hashtags for the post.'),
  suggestedPostTime: z.string().describe('A suggestion for the best time to post this content (e.g., "Weekdays 9-11 AM EST").'),
  imageGenerationPrompt: z.string().describe('A detailed textual prompt that can be used to generate a new, professional-looking image relevant to the post and niche. This prompt should be suitable for an AI image generator.'),
  category: z.string().describe('The identified or suggested category/niche for this post based on the content and user input.'),
});
export type GeneratePostDetailsOutput = z.infer<typeof GeneratePostDetailsOutputSchema>;

export async function generatePostDetails(
  input: GeneratePostDetailsInput
): Promise<GeneratePostDetailsOutput> {
  return generatePostDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePostDetailsPrompt',
  input: {schema: GeneratePostDetailsInputSchema},
  output: {schema: GeneratePostDetailsOutputSchema},
  prompt: `You are an expert social media strategist and content creator.
Your task is to generate comprehensive details for an Instagram post.
You will be provided with an image and an optional user-specified niche.

Input Image: {{media url=photoDataUri}}
User-provided Niche: {{#if userNiche}}"{{{userNiche}}}"{{else}}Not specified{{/if}}

Based on the input image and the niche (if provided, otherwise infer from image), please generate the following:
1.  **Engaging Caption**: A captivating caption for a general Instagram audience. Make it friendly and relatable.
2.  **Professional Caption**: A more formal and polished version of the caption, suitable for a business or professional profile.
3.  **Hashtags**: A comma-separated string of 3-5 highly relevant and effective hashtags.
4.  **Suggested Post Time**: Recommend an optimal time to post this content (e.g., "Weekdays 9-11 AM EST," "Saturday afternoon").
5.  **Image Generation Prompt**: Create a detailed and descriptive prompt (around 30-50 words) that an AI image generator (like DALL-E or Midjourney) could use to create a new, high-quality, professional-looking image. This image should be inspired by the original photo and fit the specified (or inferred) niche. Describe the desired style, subject, mood, and composition. For example: "Professional flat lay photograph of a healthy smoothie bowl with fresh berries and granola, on a clean marble background, bright natural lighting, top-down view, vibrant and appetizing. Niche: Health Food."
6.  **Category**: Identify or suggest a primary category or niche for this post (e.g., "Travel," "Food," "Fitness," "Tech," "Fashion"). If a niche was provided by the user, you can confirm it or suggest a more specific sub-niche if appropriate.

Ensure your output strictly adheres to the defined output schema.
`,
});

const generatePostDetailsFlow = ai.defineFlow(
  {
    name: 'generatePostDetailsFlow',
    inputSchema: GeneratePostDetailsInputSchema,
    outputSchema: GeneratePostDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate post details from AI model.");
    }
    return output;
  }
);
