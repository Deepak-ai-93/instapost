
"use client";

import { useState } from "react";
import NextImage from "next/image";
import { generateLogo, type GenerateLogoOutput } from "@/ai/flows/generate-logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Sparkles, DraftingCompass, Palette, Info, Edit3, Bot } from "lucide-react"; // Added Bot icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LogoDesignerPage() {
  const [niche, setNiche] = useState<string>("");
  const [logoDescription, setLogoDescription] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [generatedLogoDataUri, setGeneratedLogoDataUri] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const resetAllContent = () => {
    setNiche("");
    setLogoDescription("");
    setCompanyName("");
    setGeneratedLogoDataUri(null);
    setError(null);
  };

  const handleGenerateLogo = async () => {
    if (!niche.trim()) {
      setError("Please enter a niche for your logo.");
      toast({ variant: "destructive", title: "Error", description: "Please enter a niche." });
      return;
    }
    if (!logoDescription.trim()) {
      setError("Please describe your desired logo.");
      toast({ variant: "destructive", title: "Error", description: "Please enter a logo description." });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedLogoDataUri(null);

    try {
      const result = await generateLogo({ 
        niche, 
        logoDescription,
        companyName: companyName.trim() || undefined,
      });
      setGeneratedLogoDataUri(result.logoImageDataUri);
      toast({ title: "Success!", description: "AI Logo generated successfully!" });
    } catch (err) {
      console.error("Failed to generate logo:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate AI logo: ${errorMessage}`);
      toast({ variant: "destructive", title: "Logo Generation Error", description: `Failed to generate AI logo. ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadDataUri = (dataUri: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadGeneratedLogo = () => {
    if (generatedLogoDataUri) {
      downloadDataUri(generatedLogoDataUri, `ai_logo_${niche.replace(/\s+/g, '_')}.png`);
      toast({ title: "Success", description: "AI generated logo download started!" });
    }
  };

  const canGenerate = niche.trim() && logoDescription.trim();

  return (
    <div className="flex flex-col items-center min-h-screen bg-background py-0"> 
      <header className="mb-10 text-center w-full">
        <div className="flex items-center justify-center mb-2">
          <DraftingCompass className="h-10 w-10 text-primary mr-3" />
          <h1 className="text-5xl font-bold text-primary">AI Logo Designer</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Craft a unique logo with AI. Describe your vision, and let AI bring it to life!
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <Card className="shadow-xl rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center"><Edit3 className="mr-2 h-6 w-6 text-primary" />Define Your Logo</CardTitle>
            <CardDescription>Provide details about your brand and what you envision for your logo.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-10 space-y-6">
            <div>
              <Label htmlFor="niche-input" className="text-lg font-semibold text-foreground mb-2 block">
                Niche / Industry*
              </Label>
              <Input
                id="niche-input"
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., Tech Startup, Coffee Shop, Eco-Friendly Products"
                className="focus:ring-accent focus:border-accent text-base"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">The primary area your brand operates in.</p>
            </div>

            <div>
              <Label htmlFor="company-name-input" className="text-lg font-semibold text-foreground mb-2 block">
                Company Name (Optional)
              </Label>
              <Input
                id="company-name-input"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., InnovateX, Brew & Bean"
                className="focus:ring-accent focus:border-accent text-base"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">If you want text in your logo, AI will try to include this.</p>
            </div>
            
            <div>
              <Label htmlFor="logo-description-input" className="text-lg font-semibold text-foreground mb-2 block flex items-center">
                <Palette className="h-5 w-5 mr-2 text-primary" /> Describe Your Desired Logo*
              </Label>
              <Textarea
                id="logo-description-input"
                value={logoDescription}
                onChange={(e) => setLogoDescription(e.target.value)}
                placeholder="e.g., Minimalist icon of a stylized leaf, vibrant green and earthy brown colors, modern sans-serif font for text 'EcoBloom'. Abstract geometric shape representing connection. Playful mascot character."
                rows={5}
                className="focus:ring-accent focus:border-accent text-base resize-none"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">Specify elements, colors, style (e.g., minimalist, abstract, illustrative), mood, and any text.</p>
            </div>
            
            <Alert variant="default" className="p-3">
                <Info className="h-5 w-5" />
                <AlertTitle className="text-sm font-medium">Generation Tips</AlertTitle>
                <AlertDescription className="text-xs">
                    Be specific! The more detail you provide (style, objects, colors, mood), the better the AI can match your vision. Mention if you prefer icon-only, text-only, or combination logos. AI logo generation is experimental, results may vary.
                </AlertDescription>
            </Alert>
            
            <div className="pt-2">
              <div className="flex space-x-2">
                <Button
                  onClick={handleGenerateLogo}
                  disabled={!canGenerate || isLoading}
                  className="flex-grow bg-accent hover:bg-accent/90 text-accent-foreground text-base py-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-6 w-6 mr-2" />
                  )}
                  {isLoading ? "Designing Your Logo..." : "Generate AI Logo"}
                </Button>
                 <Button 
                    variant="outline" 
                    onClick={resetAllContent} 
                    aria-label="Clear all inputs and generated logo" 
                    disabled={isLoading && !niche && !logoDescription && !companyName && !generatedLogoDataUri}
                >
                    Clear All
                </Button>
              </div>
              {error && !isLoading && <p className="text-sm text-destructive mt-2">{error}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl rounded-xl overflow-hidden flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center">
                <Bot className="mr-2 h-6 w-6 text-primary" /> Your AI Generated Logo
                </CardTitle>
                <CardDescription>
                {isLoading ? "Your logo is being designed..." : (generatedLogoDataUri ? "Here's your AI-generated logo. You can download it below." : "Your generated logo will appear here.")}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-grow flex flex-col items-center justify-center">
                {isLoading ? (
                    <div className="text-center">
                        <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-accent" />
                        <p className="text-lg text-muted-foreground">AI is crafting your masterpiece...</p>
                        <p className="text-sm text-muted-foreground mt-1">This may take a moment.</p>
                    </div>
                ) : generatedLogoDataUri ? (
                    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto space-y-4">
                        <div className="aspect-square border-2 border-dashed border-accent rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden relative group p-4">
                        <NextImage
                            src={generatedLogoDataUri}
                            alt={`AI generated logo for ${niche}`}
                            layout="fill"
                            objectFit="contain"
                            data-ai-hint={`${niche.split(" ")[0] || ""} logo design`.trim()}
                        />
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Your generated logo will appear here once created.</p>
                    </div>
                )}
            </CardContent>
            {generatedLogoDataUri && !isLoading && (
                <CardFooter className="p-6 border-t">
                    <Button
                        onClick={handleDownloadGeneratedLogo}
                        variant="outline"
                        className="w-full"
                        disabled={!generatedLogoDataUri}
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Download Logo
                    </Button>
                </CardFooter>
            )}
        </Card>
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Deepak AI. All rights reserved.</p>
        <p>Powered by AI magic ✨</p>
      </footer>
    </div>
  );
}
