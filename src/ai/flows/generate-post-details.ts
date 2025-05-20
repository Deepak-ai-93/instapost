
'use server';

/**
 * @fileOverview AI-powered Instagram post details generator.
 *
 * - generatePostDetails - A function that generates various details for an Instagram post based on a niche.
 * - GeneratePostDetailsInput - The input type for the generatePostDetails function.
 * - GeneratePostDetailsOutput - The return type for the generatePostDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePostDetailsInputSchema = z.object({
  userNiche: z.string().describe('The user-provided niche or category for the post.'),
});
export type GeneratePostDetailsInput = z.infer<typeof GeneratePostDetailsInputSchema>;

const GeneratePostDetailsOutputSchema = z.object({
  engagingCaption: z.string().describe('An engaging and relevant caption for the image, suitable for a general audience based on the niche.'),
  professionalCaption: z.string().describe('A more formal or professional version of the caption for the niche.'),
  hashtags: z.string().describe('A comma-separated list of 3-5 relevant hashtags for the post in the niche.'),
  suggestedPostTime: z.string().describe('A suggestion for the best time to post this content (e.g., "Weekdays 9-11 AM EST") for the niche.'),
  headlineText: z.string().describe('A short, bold, and engaging headline (3-7 words) for the image, highly relevant to the niche and suitable for an Instagram post graphic.'),
  imageGenerationPrompt: z.string().describe('The fully constructed image generation prompt using the universal template, user niche, and generated headline.'),
  category: z.string().describe('The identified or suggested category/niche for this post based on the user input.'),
});
export type GeneratePostDetailsOutput = z.infer<typeof GeneratePostDetailsOutputSchema>;

export async function generatePostDetails(
  input: GeneratePostDetailsInput
): Promise<GeneratePostDetailsOutput> {
  return generatePostDetailsFlow(input);
}

const universalImagePromptTemplate = "A high-quality, visually engaging Instagram post background related to the niche {NICHE}. The image includes a large, bold headline text that says: \"{HEADLINE}\" in modern typography, centered or creatively placed on the design. The overall composition is clean and attention-grabbing, with space for branding or additional elements. Use vibrant or niche-appropriate colors, gradient overlays, and subtle textures. The design follows Instagram 1:1 square format. Ensure the visual is aesthetic, scroll-stopping, and suited for social media engagement.";

const postDetailsSystemPrompt = ai.definePrompt({
  name: 'generatePostDetailsPrompt',
  input: {schema: GeneratePostDetailsInputSchema},
  // Note: The output schema here is for what the LLM directly outputs.
  // The final imageGenerationPrompt is constructed in the flow.
  output: {schema: z.object({
      engagingCaption: GeneratePostDetailsOutputSchema.shape.engagingCaption,
      professionalCaption: GeneratePostDetailsOutputSchema.shape.professionalCaption,
      hashtags: GeneratePostDetailsOutputSchema.shape.hashtags,
      suggestedPostTime: GeneratePostDetailsOutputSchema.shape.suggestedPostTime,
      headlineText: GeneratePostDetailsOutputSchema.shape.headlineText,
      category: GeneratePostDetailsOutputSchema.shape.category,
  })},
  prompt: `You are an expert social media strategist and content creator.
Your task is to generate comprehensive details for an Instagram post based *solely* on a user-specified niche.

User-provided Niche: "{{{userNiche}}}"

Based on this niche, please generate the following:
1.  **Engaging Caption**: A captivating caption (around 3-4 sentences) for a general Instagram audience. Make it friendly, relatable, and highly relevant to the niche. Include a call to action or a question if appropriate.
2.  **Professional Caption**: A more formal and polished version of the caption (around 3-4 sentences), suitable for a business or professional profile within this niche. Maintain relevance to the niche.
3.  **Hashtags**: A comma-separated string of 3-5 highly relevant and effective hashtags for the niche.
4.  **Suggested Post Time**: Recommend an optimal time to post content related to this niche (e.g., "Weekdays 9-11 AM EST," "Saturday afternoon").
5.  **Headline Text**: A short, bold, and engaging headline (3-7 words) that would be suitable to display prominently on an Instagram post image. This headline should be directly related to the "{{userNiche}}" and the generated captions. For example, if the niche is "Minimalist Home Office Setup," a headline could be "Focus & Flow" or "Simplify Your Workspace."
6.  **Category**: Confirm or suggest the primary category for this niche (e.g., "Travel," "Food," "Fitness," "Tech," "Fashion").

Ensure your output strictly adheres to the defined output schema. Do NOT generate the full image prompt, only the headlineText.
`,
});

const generatePostDetailsFlow = ai.defineFlow(
  {
    name: 'generatePostDetailsFlow',
    inputSchema: GeneratePostDetailsInputSchema,
    outputSchema: GeneratePostDetailsOutputSchema,
  },
  async (input: GeneratePostDetailsInput) => {
    const {output: llmOutput} = await postDetailsSystemPrompt(input);
    if (!llmOutput) {
      throw new Error("Failed to generate post details from AI model.");
    }

    // Construct the final imageGenerationPrompt using the universal template
    const finalImagePrompt = universalImagePromptTemplate
      .replace('{NICHE}', input.userNiche)
      .replace('{HEADLINE}', llmOutput.headlineText);

    return {
      ...llmOutput,
      imageGenerationPrompt: finalImagePrompt,
    };
  }
);
