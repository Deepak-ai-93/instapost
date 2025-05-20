
'use server';

/**
 * @fileOverview AI-powered Instagram post details generator.
 *
 * - generatePostDetails - A function that generates various details for an Instagram post based on a user-provided niche, category, and optional image description.
 * - GeneratePostDetailsInput - The input type for the generatePostDetails function.
 * - GeneratePostDetailsOutput - The return type for the generatePostDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePostDetailsInputSchema = z.object({
  userNiche: z.string().describe('The user-provided niche for the post.'),
  userCategory: z.string().describe('The user-provided category for the post.'),
  userImageDescription: z.string().optional().describe('Optional user-provided details about desired image elements, colors, text orientation, etc. The AI will enhance and incorporate this.'),
});
export type GeneratePostDetailsInput = z.infer<typeof GeneratePostDetailsInputSchema>;

const GeneratePostDetailsOutputSchema = z.object({
  engagingCaption: z.string().describe('An engaging and relevant caption for the image, suitable for a general audience based on the niche and category.'),
  professionalCaption: z.string().describe('A more formal or professional version of the caption for the niche and category.'),
  hashtags: z.string().describe('A comma-separated list of 3-5 relevant hashtags for the post in the niche and category.'),
  suggestedPostTime: z.string().describe('A suggestion for the best time to post this content (e.g., "Weekdays 9-11 AM EST") for the niche and category.'),
  headlineText: z.string().describe('A short, bold, and engaging headline (3-7 words) for the image, highly relevant to the niche, category, and potentially user image description.'),
  imageGenerationPrompt: z.string().describe('The fully constructed image generation prompt, incorporating the user niche, category, generated headline, and enhanced user image description (if provided), built upon a universal template.'),
});
export type GeneratePostDetailsOutput = z.infer<typeof GeneratePostDetailsOutputSchema>;

export async function generatePostDetails(
  input: GeneratePostDetailsInput
): Promise<GeneratePostDetailsOutput> {
  return generatePostDetailsFlow(input);
}

const postDetailsSystemPrompt = ai.definePrompt({
  name: 'generatePostDetailsPrompt',
  input: {schema: GeneratePostDetailsInputSchema},
  output: {schema: GeneratePostDetailsOutputSchema}, // AI generates all fields directly now
  prompt: `You are an expert social media strategist and content creator.
Your task is to generate comprehensive details for an Instagram post.

User-provided Niche: "{{{userNiche}}}"
User-provided Category: "{{{userCategory}}}"
{{#if userImageDescription}}
User-provided Image Description: "{{{userImageDescription}}}"
{{/if}}

Based on this information, please generate the following:

1.  **Engaging Caption**: A captivating caption (around 3-4 sentences) for a general Instagram audience. Make it friendly, relatable, and highly relevant to the niche and category. Include a call to action or a question if appropriate.
2.  **Professional Caption**: A more formal and polished version of the caption (around 3-4 sentences), suitable for a business or professional profile within this niche and category. Maintain relevance.
3.  **Hashtags**: A comma-separated string of 3-5 highly relevant and effective hashtags for the niche and category.
4.  **Suggested Post Time**: Recommend an optimal time to post content related to this niche and category (e.g., "Weekdays 9-11 AM EST," "Saturday afternoon").
5.  **Headline Text**: A short, bold, and engaging headline (3-7 words) that would be suitable to display prominently on an Instagram post image. This headline should be directly related to the "{{userNiche}}", "{{userCategory}}", and the generated captions. If a \`userImageDescription\` is provided, ensure the headline complements it. For example, if the niche is "Minimalist Home Office Setup" and category is "Productivity", a headline could be "Focus & Flow" or "Simplify Your Workspace."

6.  **Image Generation Prompt**: Construct a detailed prompt for an AI image generator. This prompt MUST follow this universal template structure:
    "A high-quality, visually engaging Instagram post background related to the niche {{{userNiche}}} and category {{{userCategory}}}. The image includes a large, bold headline text that says: \\"{GENERATED_HEADLINE_TEXT}\\" in modern typography, centered or creatively placed on the design. [DETAILED_IMAGE_DESCRIPTION_AREA]. The overall composition is clean and attention-grabbing, with space for branding or additional elements. Use vibrant or niche/category-appropriate colors, gradient overlays, and subtle textures. The design follows Instagram 1:1 square format. Ensure the visual is aesthetic, scroll-stopping, and suited for social media engagement."

    *   Replace \\"{GENERATED_HEADLINE_TEXT}\\" with the \`headlineText\` you just generated (item 5).
    *   For the "[DETAILED_IMAGE_DESCRIPTION_AREA]" part:
        *   If a \`userImageDescription\` ("{{{userImageDescription}}}") was provided by the user, you MUST expand upon it. Incorporate their specified elements, colors, text orientation, positions, and any other details. Enhance their description to make it richer, more vivid, and to ensure it forms a coherent and effective part of the overall image prompt. Ensure the style is creative and not like a generic stock photo.
        *   If NO \`userImageDescription\` was provided, use your creative expertise to describe relevant visual elements, specific objects, scenes, color palettes, art styles (e.g., photorealistic, illustrative, abstract, minimalist, vibrant, muted), lighting, and composition based on the "{{userNiche}}", "{{userCategory}}", and the generated \`headlineText\`. Aim for originality and visual appeal, avoiding generic stock photo appearances. Describe a scene or concept in detail.

Ensure your output strictly adheres to the defined output schema for all fields. The final \`imageGenerationPrompt\` should be a single, complete string.
`,
});

const generatePostDetailsFlow = ai.defineFlow(
  {
    name: 'generatePostDetailsFlow',
    inputSchema: GeneratePostDetailsInputSchema,
    outputSchema: GeneratePostDetailsOutputSchema,
  },
  async (input: GeneratePostDetailsInput) => {
    const {output} = await postDetailsSystemPrompt(input);
    if (!output) {
      throw new Error("Failed to generate post details from AI model.");
    }
    return output; // The AI now generates the full output schema directly
  }
);
