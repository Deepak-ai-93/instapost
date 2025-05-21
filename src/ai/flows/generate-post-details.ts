
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
  userImageDescription: z.string().optional().describe('Optional user-provided details about desired image elements, colors, text orientation, positions, etc. The AI will enhance and incorporate this.'),
});
export type GeneratePostDetailsInput = z.infer<typeof GeneratePostDetailsInputSchema>;

const GeneratePostDetailsOutputSchema = z.object({
  engagingCaption: z.string().describe('An engaging and relevant caption for the image, suitable for a general audience. It should start with a strong hook, potentially use a mini-thread structure if applicable, and end with a compelling call to action or finisher to maximize engagement.'),
  professionalCaption: z.string().describe('A more formal or professional version of the caption. It should also start with a strong hook, maintain a clear structure, and end with a professional call to action or concluding thought for engagement.'),
  hashtags: z.string().describe('A comma-separated list of 3-5 relevant hashtags for the post in the niche and category. Each hashtag MUST start with "#" (e.g., #sustainability, #traveltips).'),
  suggestedPostTime: z.string().describe('A suggestion for the best time to post this content (e.g., "Weekdays 9-11 AM EST") for the niche and category.'),
  headlineText: z.string().describe('A short, bold, and engaging headline (3-7 words) for the image. This should be a powerful hook or concise benefit, highly relevant to the niche, category, and designed for maximum engagement. It should be suitable for direct use as text on the image.'),
  imageGenerationPrompt: z.string().describe('The fully constructed image generation prompt, incorporating the user niche, category, generated headline, and enhanced user image description (if provided), built upon a universal template. This prompt should aim for non-stock, content-rich visuals, considering social media aspect ratios (like 1:1 square or 4:5 portrait) and potentially including the headline text directly in the image design.'),
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
  output: {schema: GeneratePostDetailsOutputSchema}, 
  prompt: `You are an expert social media strategist and content creator specializing in maximizing engagement.
Your task is to generate comprehensive details for an Instagram post.

User-provided Niche: "{{{userNiche}}}"
User-provided Category: "{{{userCategory}}}"
{{#if userImageDescription}}
User-provided Image Description: "{{{userImageDescription}}}"
{{/if}}

Based on this information, please generate the following:

1.  **Engaging Caption**: 
    *   Craft a captivating caption (around 3-5 sentences) for a general Instagram audience.
    *   **Hook:** Start with a strong, attention-grabbing opening line or question.
    *   **Structure (Mini-Thread if applicable):** If the content lends itself, structure the main points clearly (e.g., using short paragraphs, or suggestive lead-ins).
    *   **Finisher/CTA:** Conclude with a compelling call to action (e.g., "Comment below!", "Tap the link in bio!"), a thought-provoking question, or a strong finishing statement to encourage interaction and maximize engagement.
    *   Ensure high relevance to the niche and category.

2.  **Professional Caption**:
    *   Develop a more formal and polished version of the caption (around 3-5 sentences), suitable for a business or professional profile within this niche and category.
    *   **Hook:** Begin with a compelling, professional hook relevant to the audience.
    *   **Structure:** Maintain a clear, logical flow.
    *   **Finisher/CTA:** End with a professional call to action, an invitation for discussion, or a concise concluding thought to maximize engagement.
    *   Maintain relevance to the niche and category.

3.  **Hashtags**: A comma-separated string of 3-5 highly relevant and effective hashtags for the niche and category. Each hashtag MUST start with a '#' symbol (e.g., #sustainability, #traveltips, #digitalnomad). Focus on a mix of broad and specific terms.

4.  **Suggested Post Time**: Recommend an optimal time to post content related to this niche and category (e.g., "Weekdays 9-11 AM EST," "Saturday afternoon").

5.  **Headline Text**: 
    *   Create a short, bold, and exceptionally captivating headline (3-7 words) suitable for display on an Instagram post image.
    *   This headline should be a powerful hook, a surprising statement, or a highly concise benefit directly related to the "{{userNiche}}", "{{userCategory}}", and the core message of the captions. It must be designed to stop scrolling and spark curiosity.
    *   Incorporate engagement tactics: use strong hooks and compelling language.
    *   If a \`userImageDescription\` is provided, ensure the headline complements it.

6.  **Image Generation Prompt**: Construct a detailed prompt for an AI image generator. This prompt MUST follow this universal template structure:
    "A high-quality, visually engaging Instagram post background related to the niche {{{userNiche}}} and category {{{userCategory}}}. The image includes a large, bold headline text that says: \\"{GENERATED_HEADLINE_TEXT}\\" in modern typography, centered or creatively placed on the design. [DETAILED_IMAGE_DESCRIPTION_AREA]. The overall composition is clean and attention-grabbing, with space for branding or additional elements. Use vibrant or niche/category-appropriate colors, gradient overlays, and subtle textures. The design follows Instagram 1:1 square format. Ensure the visual is aesthetic, scroll-stopping, and suited for social media engagement."

    *   Replace \\"{GENERATED_HEADLINE_TEXT}\\" with the \`headlineText\` you just generated (item 5).
    *   For the "[DETAILED_IMAGE_DESCRIPTION_AREA]" part:
        *   If a \`userImageDescription\` ("{{{userImageDescription}}}") was provided by the user, you MUST expand upon it. Incorporate their specified elements, colors, text orientation, positions, and any other details. Enhance their description to make it richer, more vivid, and to ensure it forms a coherent and effective part of the overall image prompt. The goal is to create a unique, content-rich image that avoids generic stock photo appearances. Describe a scene or concept in detail with rich visual language, focusing on elements, colors, textures, lighting, and overall mood.
        *   If NO \`userImageDescription\` was provided, use your creative expertise to describe relevant visual elements, specific objects, scenes, color palettes, art styles (e.g., photorealistic, illustrative, abstract, minimalist, vibrant, muted), lighting, and composition based on the "{{userNiche}}", "{{userCategory}}", and the generated \`headlineText\`. Aim for originality, visual appeal, and a content-rich design avoiding generic stock photo appearances. Describe a scene or concept in detail with rich visual language.

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
    return output; 
  }
);

