
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
  imageGenerationPrompt: z.string().describe('A detailed textual prompt (50-70 words) for an AI image generator to create a unique, professional, and content-rich image relevant to the niche. The image should be suitable for social media (e.g., square or portrait aspect ratio), avoid stock photo styles, and potentially include relevant, short text overlays if it enhances the message. It should describe subject, action, scene, style, composition, lighting, mood, and key details.'),
  category: z.string().describe('The identified or suggested category/niche for this post based on the user input.'),
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
Your task is to generate comprehensive details for an Instagram post based *solely* on a user-specified niche.

User-provided Niche: "{{{userNiche}}}"

Based on this niche, please generate the following:
1.  **Engaging Caption**: A captivating caption (around 3-4 sentences) for a general Instagram audience. Make it friendly, relatable, and highly relevant to the niche. Include a call to action or a question if appropriate.
2.  **Professional Caption**: A more formal and polished version of the caption (around 3-4 sentences), suitable for a business or professional profile within this niche. Maintain relevance to the niche.
3.  **Hashtags**: A comma-separated string of 3-5 highly relevant and effective hashtags for the niche.
4.  **Suggested Post Time**: Recommend an optimal time to post content related to this niche (e.g., "Weekdays 9-11 AM EST," "Saturday afternoon").
5.  **Image Generation Prompt**: Craft a highly detailed and creative prompt (around 50-70 words) for an AI image generator. The goal is to produce a unique, professional, and compelling image that deeply resonates with the niche, **avoiding generic or stock photo appearances**. The image should be:
    *   **Highly Relevant**: Directly connected to the niche "{{userNiche}}" and the themes of the generated captions.
    *   **Social Media Optimized**: Consider a square (1:1) or portrait (e.g., 4:5) aspect ratio.
    *   **Potentially Include Text**: If appropriate for the niche and message, suggest the inclusion of short, impactful, and stylistically fitting text overlay (e.g., a catchy phrase, a key takeaway related to "{{userNiche}}"). Clearly specify the desired text and suggest its style and placement.
    *   **Detailed Description**:
        *   **Subject & Action**: What is happening? Who or what is the focus? Are there interactions or a sense of story?
        *   **Scene & Environment**: Detailed background, setting, and atmosphere. Include specific elements.
        *   **Visual Style & Medium**: e.g., 'cinematic photograph', 'digital painting', 'concept art', 'flat lay illustration', 'minimalist graphic design'. Be specific and aim for a professional look.
        *   **Composition & Perspective**: e.g., 'dynamic angle', 'close-up detail', 'symmetrical balance', 'leading lines'.
        *   **Lighting & Mood**: e.g., 'dramatic studio lighting', 'soft natural light', 'vibrant and energetic', 'calm and serene'.
        *   **Key Elements & Details**: Specific objects, textures, colors (consider a cohesive palette), patterns, or motifs that add depth and uniqueness.
    Aim for a prompt that inspires an image rich in content, visual interest, and storytelling potential, truly capturing the essence of '{{userNiche}}'. For example, if the niche is "Minimalist Home Office Setup," a prompt could be: "Minimalist graphic design, 1:1 aspect ratio, featuring a sleek white desk with a modern laptop, a single small potted succulent, and a motivational quote 'Focus & Flow' in elegant sans-serif font subtly placed in the upper right. Clean, bright overhead lighting, creating a calm and productive mood. Dominant colors: white, light grey, and a touch of green."
6.  **Category**: Confirm or suggest the primary category for this niche (e.g., "Travel," "Food," "Fitness," "Tech," "Fashion").

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

