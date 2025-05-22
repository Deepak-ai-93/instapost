
'use server';
/**
 * @fileOverview AI-powered logo generator.
 *
 * - generateLogo - A function that generates a logo based on user inputs.
 * - GenerateLogoInput - The input type for the generateLogo function.
 * - GenerateLogoOutput - The return type for the generateLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLogoInputSchema = z.object({
  niche: z.string().describe('The primary niche or industry for the brand/logo.'),
  logoDescription: z.string().describe('Detailed description of the desired logo, including elements, style, colors, mood, and any specific text if desired.'),
  companyName: z.string().optional().describe('Optional company name to attempt to incorporate into the logo design.'),
});
export type GenerateLogoInput = z.infer<typeof GenerateLogoInputSchema>;

const GenerateLogoOutputSchema = z.object({
  logoImageDataUri: z
    .string()
    .describe(
      "The generated logo image as a data URI, including MIME type and Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateLogoOutput = z.infer<typeof GenerateLogoOutputSchema>;

export async function generateLogo(
  input: GenerateLogoInput
): Promise<GenerateLogoOutput> {
  return generateLogoFlow(input);
}

// This prompt is now fully configured for image generation
const configuredLogoGenerationPrompt = ai.definePrompt({
  name: 'configuredLogoGenerationPrompt',
  model: 'googleai/gemini-2.0-flash-exp', // Specify the image generation model
  input: {schema: GenerateLogoInputSchema},
  // No explicit output text schema needed if the primary goal is the image.
  // The model might still return text, but we're focused on response.media.
  prompt: `You are an expert logo designer. Generate a professional and iconic logo based on the following details:
Niche: "{{niche}}"
{{#if companyName}}Company Name: "{{companyName}}" (Attempt to incorporate this text stylishly if appropriate for the design).{{/if}}
Logo Description by User: "{{logoDescription}}"

Key Design Guidelines:
- Visual Style: Modern, clean, and visually striking. Consider if the user's description implies a minimalist, abstract, illustrative, or typographic style.
- Simplicity & Memorability: The design should be simple enough to be easily remembered and recognized.
- Scalability: It must look good at small sizes (e.g., favicon, app icon) and large formats. Avoid overly intricate details that would be lost at small scales.
- Iconography & Typography: If text is implied by the description or company name, integrate it clearly and legibly using a modern and appropriate font style. The icon (if any) should be symbolic and relevant.
- Background: Generate the logo on a transparent background if possible, otherwise a plain white background. This is crucial for versatility.
- Aspect Ratio: Strictly 1:1 (square).
- Color Palette: Use colors that are appropriate for the "{{niche}}" and align with the mood described in "{{logoDescription}}".
- Uniqueness: Aim for an original design, not a generic template.
- Output: The final output should be ONLY the logo image itself, perfectly centered, and adhering to the 1:1 aspect ratio. Do not add any extra text, annotations, or background elements beyond the logo itself and its specified background.
`,
  config: {
    responseModalities: ['TEXT', 'IMAGE'], // Gemini 2.0 flash exp needs TEXT even if image is primary.
    // safetySettings: [{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }]
  },
});

const generateLogoFlow = ai.defineFlow(
  {
    name: 'generateLogoFlow',
    inputSchema: GenerateLogoInputSchema,
    outputSchema: GenerateLogoOutputSchema,
  },
  async (input: GenerateLogoInput) => {
    // Execute the fully configured prompt that handles image generation
    const response = await configuredLogoGenerationPrompt(input);

    // Extract media URL more robustly, checking candidates as Gemini might place it there
    let mediaUrl = response.media?.url; 
    if (!mediaUrl && response.candidates?.[0]?.message?.content) {
      for (const part of response.candidates[0].message.content) {
        if (part.media?.url) {
          mediaUrl = part.media.url;
          break;
        }
      }
    }

    if (!mediaUrl) {
      console.error('Logo generation response details:', JSON.stringify(response, null, 2));
      throw new Error('AI failed to generate a logo image. No media URL found in response.');
    }
    
    return { logoImageDataUri: mediaUrl };
  }
);
