
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

const logoSystemPrompt = ai.definePrompt({
  name: 'generateLogoPrompt',
  input: {schema: GenerateLogoInputSchema},
  // REMOVED: output: {schema: z.object({}) }, // This was causing the error.
                                             // The primary output is the image from ai.generate's media field.
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
});

const generateLogoFlow = ai.defineFlow(
  {
    name: 'generateLogoFlow',
    inputSchema: GenerateLogoInputSchema,
    outputSchema: GenerateLogoOutputSchema,
  },
  async (input: GenerateLogoInput) => {
    // Construct the prompt string using the logoSystemPrompt
    const resolvedPrompt = await logoSystemPrompt(input);

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // This model can generate images
      prompt: resolvedPrompt, // Pass the resolved prompt string/object
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Expecting an image
        // safetySettings: [{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }]
      },
    });

    if (!media?.url) {
      throw new Error('AI failed to generate a logo image.');
    }
    
    return { logoImageDataUri: media.url };
  }
);

