
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
  userImageDescription: z.string().optional().describe('Optional user-provided details about desired image elements, colors, text orientation, positions, font styles for text on image, overall visual style, etc. The AI will enhance and incorporate this.'),
  userLogoImageUrl: z.string().optional().describe("Optional: The user's logo as a public image URL."),
  userContactInfoDescription: z.string().optional().describe('Optional user-provided description for contact information (e.g., "area for phone number and email at the bottom", "stylized icons for phone/email").'),
  userHookThreadStyleDescription: z.string().optional().describe('Optional user-provided details on the desired style or visual positioning for hooks or thread-like text elements, especially if they are to appear on the image (e.g., "headline hook large and centered at top", "visual elements suggesting an unfolding story for a thread").'),
});
export type GeneratePostDetailsInput = z.infer<typeof GeneratePostDetailsInputSchema>;

const GeneratePostDetailsOutputSchema = z.object({
  engagingCaption: z.string().describe('An engaging and relevant caption for the image, suitable for a general audience. It should start with a strong hook, potentially use a mini-thread structure if applicable, and end with a compelling call to action or finisher to maximize engagement.'),
  professionalCaption: z.string().describe('A more formal or professional version of the caption. It should also start with a strong hook, maintain a clear structure, and end with a professional call to action or concluding thought for engagement.'),
  hashtags: z.string().describe('A comma-separated list of 3-5 relevant hashtags for the post in the niche and category. Each hashtag MUST start with "#" (e.g., #sustainability, #traveltips).'),
  suggestedPostTime: z.string().describe('A suggestion for the best time to post this content (e.g., "Weekdays 9-11 AM EST") for the niche and category.'),
  headlineText: z.string().describe('A short, bold, and engaging headline (3-7 words) for the image. This should be a powerful hook or concise benefit, highly relevant to the niche, category, and designed for maximum engagement. It should be suitable for direct use as text on the image.'),
  imageGenerationPrompt: z.string().describe('The fully constructed image generation prompt, incorporating the user niche, category, generated headline, enhanced user image description, branding considerations (logo URL, contact, hook/thread style), built upon a universal template. This prompt should aim for non-stock, content-rich visuals, considering social media aspect ratios (like 1:1 square or 4:5 portrait) and potentially including the headline text directly in the image design. It should detail visual hooks, alignment, styles, colors, and mood.'),
  logoImageUrlForImageGen: z.string().optional().describe("The user's logo image URL, passed through if provided, to be used by the image generation flow."),
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
  output: {schema: GeneratePostDetailsOutputSchema.omit({ logoImageUrlForImageGen: true })}, // AI doesn't generate this, flow passes it.
  prompt: `You are an expert social media strategist and content creator specializing in maximizing engagement.
Your task is to generate comprehensive details for an Instagram post.

User-provided Niche: "{{{userNiche}}}"
User-provided Category: "{{{userCategory}}}"
{{#if userImageDescription}}
User-provided Image Description: "{{{userImageDescription}}}"
{{/if}}
{{#if userLogoImageUrl}}
User has provided a logo URL: "{{{userLogoImageUrl}}}"
{{/if}}
{{#if userContactInfoDescription}}
User-provided Contact Info Ideas (Text): "{{{userContactInfoDescription}}}"
{{/if}}
{{#if userHookThreadStyleDescription}}
User-provided Hook/Thread Style Description: "{{{userHookThreadStyleDescription}}}"
{{/if}}

Based on this information, please generate the following:

1.  **Engaging Caption**: 
    *   Craft a captivating caption (around 3-5 sentences) for a general Instagram audience.
    *   **Hook:** Start with a strong, attention-grabbing opening line or question.
    *   **Structure (Mini-Thread if applicable):** If the content lends itself, structure the main points clearly (e.g., using short paragraphs, bullet points, or suggestive lead-ins like "Here's why:", "Tip 1:", "Next up:"). Aim for a mini-thread feel if it enhances readability and engagement.
    *   **Finisher/CTA:** Conclude with a compelling call to action (e.g., "Comment below!", "Tap the link in bio!", "What are your thoughts?"), a thought-provoking question, or a strong finishing statement to encourage interaction and maximize engagement.
    *   Ensure high relevance to the niche and category.

2.  **Professional Caption**:
    *   Develop a more formal and polished version of the caption (around 3-5 sentences), suitable for a business or professional profile within this niche and category.
    *   **Hook:** Begin with a compelling, professional hook relevant to the audience.
    *   **Structure:** Maintain a clear, logical flow. Consider using concise points if appropriate for a professional audience.
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
        *   Your goal is to create a rich, detailed description for this area. Start by describing a compelling **visual scene or concept** based on "{{userNiche}}", "{{userCategory}}", and the generated \`headlineText\`. Think about a **visual hook** – what makes the image immediately intriguing?
        *   Specify an overall **visual style** (e.g., photorealistic, illustrative, abstract, minimalist, retro, futuristic, cinematic, watercolor, 3D render, flat design).
        *   Detail the **composition and alignment** of key elements. How are things arranged? Is there a specific focal point? Describe the perspective (e.g., eye-level, bird's-eye view).
        *   For the headline text \\\`"{GENERATED_HEADLINE_TEXT}"\\\` (which is already mentioned in the template as being on the design), elaborate on its desired **font style, weight, and any visual effects** (e.g., "The headline '{GENERATED_HEADLINE_TEXT}' should be in a bold, clean sans-serif font with a subtle drop shadow for readability", "Use an elegant script font for the headline, slightly tilted upwards").
        *   Describe specific **objects, characters (if any), setting, and overall mood** (e.g., joyful, mysterious, serene, energetic).
        *   Detail the **color palette** (e.g., "a warm and inviting palette with earthy tones and a pop of vibrant orange," "a cool and modern palette dominated by blues and silvers with neon accents," "monochromatic with varying shades of green").
        *   Aim for originality, visual appeal, and a content-rich design, avoiding generic stock photo appearances.
        *   If a \`userImageDescription\` ("{{{userImageDescription}}}") was provided, you MUST expand upon it. Incorporate their specified elements, colors, text orientation, font styles, visual styles, positions, and any other details. Enhance their description by integrating the aspects above (visual hook, style, composition, font details, mood, palette) to make it richer, more vivid, and ensure it forms a coherent and effective part of the overall image prompt. If they specified a font style, prioritize that.
        *   {{#if userLogoImageUrl}}VERY IMPORTANT: The user has provided a logo URL: {{{userLogoImageUrl}}}. This logo URL itself will be passed to the image generator. Your task for this [DETAILED_IMAGE_DESCRIPTION_AREA] is to describe how the main generated image should be designed to ACCOMMODATE or COMPLEMENT this user-provided logo. For example, you might instruct the image generator to "Attempt to fetch the logo from the provided URL and integrate it smoothly into the design, perhaps in the bottom-right corner." or "Design the overall visual style to be harmonious with a typical company logo that will be referenced by URL." or "Ensure the color palette of the main image harmonizes with a typical company logo that might be overlaid." Ensure your instructions clearly guide the image generator on how to use/consider the logo from the URL. Do NOT try to describe the logo itself in detail here, but rather how the scene should relate to it.{{/if}}
        *   {{#if userContactInfoDescription}}For text-based contact info ideas: "{{{userContactInfoDescription}}}". Incorporate this by describing visual elements, for example, suggest "subtle, stylized icons representing a phone and email at the bottom" or "a designated area at the lower edge for contact details, rendered in a small, legible font."{{/if}}
        *   {{#if userHookThreadStyleDescription}}VERY IMPORTANT: The user has provided guidance on hook/thread styling: "{{{userHookThreadStyleDescription}}}". Incorporate this into the visual design of any textual elements on the image, particularly the headline. For example, if the user describes 'make the headline hook large and centered at the top', ensure your description for the headline's placement and style reflects this. If they describe 'visual elements suggesting an unfolding story for a thread concept', consider how the overall image composition or background elements might subtly hint at this, or how multiple text elements could be arranged to suggest a sequence. This description might influence font choices, text layout, background elements, or overall image composition to achieve the desired hook/thread visualization on the image.{{/if}}
        *   Combine all these aspects into a single, coherent paragraph for the "[DETAILED_IMAGE_DESCRIPTION_AREA]". Ensure this area focuses on visual descriptions and not just listing features.

Ensure your output strictly adheres to the defined output schema for all fields (excluding logoImageUrlForImageGen, which is handled by the flow). The final \`imageGenerationPrompt\` should be a single, complete string.
`,
});

const generatePostDetailsFlow = ai.defineFlow(
  {
    name: 'generatePostDetailsFlow',
    inputSchema: GeneratePostDetailsInputSchema,
    outputSchema: GeneratePostDetailsOutputSchema,
  },
  async (input: GeneratePostDetailsInput): Promise<GeneratePostDetailsOutput> => {
    const {output} = await postDetailsSystemPrompt(input); 
    if (!output) {
      throw new Error("Failed to generate post details from AI model.");
    }
    // The AI generates all fields except logoImageUrlForImageGen. We add it here.
    return {
      ...output,
      logoImageUrlForImageGen: input.userLogoImageUrl, 
    }; 
  }
);

    