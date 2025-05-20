
"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { generatePostDetails, type GeneratePostDetailsOutput } from "@/ai/flows/generate-post-details";
import { generateImageFromPrompt } from "@/ai/flows/generate-image-from-prompt";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, Download, Copy, Sparkles, Image as ImageIcon, Wand2, Palette, FileText, Info, LayoutGrid, Edit3 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function InstaGeniusPage() {
  const [userNiche, setUserNiche] = useState<string>("");
  const [userCategory, setUserCategory] = useState<string>("");
  const [userImageDescription, setUserImageDescription] = useState<string>("");
  
  const [engagingCaption, setEngagingCaption] = useState<string>("");
  const [professionalCaption, setProfessionalCaption] = useState<string>("");
  const [hashtags, setHashtags] = useState<string>("");
  const [suggestedPostTime, setSuggestedPostTime] = useState<string>("");
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState<string>("");
  const [generatedImageDataUri, setGeneratedImageDataUri] = useState<string | null>(null);
  const [headlineText, setHeadlineText] = useState<string>("");


  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const resetAllContent = () => {
    setUserNiche("");
    setUserCategory("");
    setUserImageDescription("");
    setEngagingCaption("");
    setProfessionalCaption("");
    setHashtags("");
    setSuggestedPostTime("");
    setImageGenerationPrompt("");
    setGeneratedImageDataUri(null);
    setHeadlineText("");
    setError(null);
  };

  const handleGenerateContent = async () => {
    if (!userNiche.trim() || !userCategory.trim()) {
      const missingField = !userNiche.trim() ? "niche" : "category";
      setError(`Please enter a ${missingField} first.`);
      toast({ variant: "destructive", title: "Error", description: `Please enter a ${missingField} first.` });
      return;
    }
    setIsLoading(true);
    setError(null);
    // Reset only generated content, keep inputs
    setEngagingCaption("");
    setProfessionalCaption("");
    setHashtags("");
    setSuggestedPostTime("");
    setImageGenerationPrompt("");
    setGeneratedImageDataUri(null);
    setHeadlineText("");


    try {
      setCurrentLoadingStep("Generating post details...");
      const detailsResult = await generatePostDetails({ 
        userNiche, 
        userCategory,
        userImageDescription: userImageDescription.trim() || undefined // Send undefined if empty
      });
      setEngagingCaption(detailsResult.engagingCaption);
      setProfessionalCaption(detailsResult.professionalCaption);
      setHashtags(detailsResult.hashtags);
      setSuggestedPostTime(detailsResult.suggestedPostTime);
      setImageGenerationPrompt(detailsResult.imageGenerationPrompt);
      setHeadlineText(detailsResult.headlineText);

      if (detailsResult.imageGenerationPrompt) {
        setCurrentLoadingStep("Generating AI image...");
        try {
          const imageResult = await generateImageFromPrompt({ prompt: detailsResult.imageGenerationPrompt });
          setGeneratedImageDataUri(imageResult.imageDataUri);
          toast({ title: "Success!", description: "AI content and image generated." });
        } catch (imgErr) {
          console.error("Failed to generate image:", imgErr);
          setError("Failed to generate AI image. Text details were generated.");
          toast({ variant: "destructive", title: "Image Generation Error", description: "Text details generated, but AI image creation failed." });
        }
      } else {
         toast({ title: "Success!", description: "AI content generated. No image prompt was provided by the AI." });
      }

    } catch (err) {
      console.error("Failed to generate content:", err);
      setError("Failed to generate AI content. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to generate AI content." });
    } finally {
      setIsLoading(false);
      setCurrentLoadingStep("");
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
  
  const handleDownloadGeneratedImage = () => {
    if (generatedImageDataUri) {
      downloadDataUri(generatedImageDataUri, `ai_img_${userNiche.replace(/\s+/g, '_')}_${userCategory.replace(/\s+/g, '_')}.png`);
      toast({ title: "Success", description: "AI generated image download started!" });
    }
  };

  const handleCopyText = async (text: string, type: string) => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        toast({ title: "Success", description: `${type} copied to clipboard!` });
      } catch (err) {
        console.error(`Failed to copy ${type}: `, err);
        toast({ variant: "destructive", title: "Error", description: `Failed to copy ${type}.` });
      }
    }
  };

  const hasGeneratedContent = engagingCaption || professionalCaption || hashtags || suggestedPostTime || generatedImageDataUri || imageGenerationPrompt || headlineText;
  const canGenerate = userNiche.trim() && userCategory.trim();

  return (
    <>
      <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen bg-background">
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center mb-2">
            <Wand2 className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-5xl font-bold text-primary">InstaGenius Pro</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Craft compelling Instagram posts: AI-driven content, enhanced image generation & more!
          </p>
        </header>

        <Card className="w-full max-w-3xl shadow-xl rounded-xl overflow-hidden mb-8">
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-6 w-6 text-primary" /> Define Your Content Focus</CardTitle>
            <CardDescription>Enter niche, category, and optionally describe your desired image. AI will generate post ideas, captions, hashtags, and a unique image.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="niche-input" className="text-lg font-semibold text-foreground mb-2 block">
                  1. Specify Niche*
                </Label>
                <Input
                  id="niche-input"
                  type="text"
                  value={userNiche}
                  onChange={(e) => setUserNiche(e.target.value)}
                  placeholder="e.g., Sustainable Travel, Gourmet Coffee"
                  className="focus:ring-accent focus:border-accent text-base"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">The specific topic or theme.</p>
              </div>
              <div>
                <Label htmlFor="category-input" className="text-lg font-semibold text-foreground mb-2 block">
                  2. Specify Category*
                </Label>
                <Input
                  id="category-input"
                  type="text"
                  value={userCategory}
                  onChange={(e) => setUserCategory(e.target.value)}
                  placeholder="e.g., Eco-tourism, Food & Drink"
                  className="focus:ring-accent focus:border-accent text-base"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">The broader classification.</p>
              </div>
            </div>

            <div>
                <Label htmlFor="image-description-input" className="text-lg font-semibold text-foreground mb-2 block">
                  3. Describe Desired Image (Optional)
                </Label>
                <Textarea
                  id="image-description-input"
                  value={userImageDescription}
                  onChange={(e) => setUserImageDescription(e.target.value)}
                  placeholder="e.g., A vintage map background, passport stamps scattered, vibrant teal and orange colors, text 'Adventure Awaits' in bold script font at the top."
                  rows={3}
                  className="focus:ring-accent focus:border-accent text-base resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">Specify elements, colors, text style/position. AI will enhance this.</p>
            </div>
            
            <div className="pt-2">
                <Label className="text-lg font-semibold text-foreground mb-2 block">
                    4. Generate Content & Image
                </Label>
                <div className="flex space-x-2">
                    <Button
                        onClick={handleGenerateContent}
                        disabled={!canGenerate || isLoading}
                        className="flex-grow bg-accent hover:bg-accent/90 text-accent-foreground text-base py-6"
                    >
                        {isLoading ? (
                        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                        ) : (
                        <Sparkles className="h-6 w-6 mr-2" />
                        )}
                        {isLoading ? currentLoadingStep : "Generate AI Content & Image"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetAllContent} 
                      aria-label="Clear all inputs and generated content" 
                      disabled={isLoading && !userNiche && !userCategory && !userImageDescription && !hasGeneratedContent}
                    >
                        Clear All
                    </Button>
                </div>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </div>
          </CardContent>
        </Card>

        {isLoading && currentLoadingStep.includes("Generating AI image") && imageGenerationPrompt && (
            <Card className="w-full max-w-4xl shadow-xl rounded-xl overflow-hidden mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center"><Palette className="mr-2 h-6 w-6 text-primary" /> AI Image Generation in Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-10 text-center">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-accent" />
                    <p className="text-lg text-muted-foreground">Creating your unique AI image... this may take a moment.</p>
                    {imageGenerationPrompt && <p className="text-sm text-muted-foreground mt-1">Using prompt: "{imageGenerationPrompt.substring(0,100)}..."</p>}
                </CardContent>
            </Card>
        )}

        {hasGeneratedContent && !isLoading && (
          <Card className="w-full max-w-4xl shadow-xl rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center"><Sparkles className="mr-2 h-6 w-6 text-accent" /> AI Enhanced Content for "{userNiche}" ({userCategory})</CardTitle>
              <CardDescription>Review your AI-generated content. The headline is "{headlineText}". Edit the engaging caption as needed.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 space-y-8">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Generated Image */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground block">AI Generated Image</Label>
                   <div className="aspect-square border-2 border-dashed border-accent rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden relative group">
                    {generatedImageDataUri ? (
                      <NextImage
                        src={generatedImageDataUri}
                        alt={`AI generated image for ${userNiche} - ${userCategory} with headline "${headlineText}"`}
                        layout="fill"
                        objectFit="contain"
                        data-ai-hint={`${userNiche.split(" ")[0] || ""} ${userCategory.split(" ")[0] || ""}`.trim()}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">Generated image will appear here</p>
                        {imageGenerationPrompt ? <p className="text-sm">Image based on prompt: "{imageGenerationPrompt.substring(0,50)}..."</p> : <p className="text-sm">No image could be generated.</p>}
                      </div>
                    )}
                  </div>
                  {generatedImageDataUri && (
                    <Button
                      onClick={handleDownloadGeneratedImage}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Generated Image
                    </Button>
                  )}
                   {imageGenerationPrompt && (
                    <div className="p-3 bg-muted/50 rounded-md">
                        <Label className="text-xs text-foreground font-medium block mb-1">Image Prompt Used (Enhanced by AI):</Label>
                        <p className="text-xs text-muted-foreground break-words">
                           {imageGenerationPrompt}
                        </p>
                         <Button onClick={() => handleCopyText(imageGenerationPrompt, "Image prompt")} variant="link" size="sm" className="text-xs p-0 h-auto mt-1" disabled={!imageGenerationPrompt}>
                            <Copy className="h-3 w-3 mr-1" /> Copy Prompt
                        </Button>
                    </div>
                   )}
                </div>

                {/* Generated Text Details */}
                <div className="space-y-6">
                  {headlineText && (
                     <div>
                        <Label htmlFor="headline-text" className="text-lg font-semibold text-foreground mb-1 block">Generated Headline</Label>
                         <div className="p-3 bg-primary/10 rounded-md">
                            <p id="headline-text" className="text-lg font-semibold text-primary text-center">
                                "{headlineText}"
                            </p>
                        </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="engaging-caption" className="text-lg font-semibold text-foreground mb-1 block">Engaging Caption</Label>
                    <Textarea
                      id="engaging-caption"
                      value={engagingCaption}
                      onChange={(e) => setEngagingCaption(e.target.value)}
                      placeholder="Engaging caption"
                      rows={5}
                      className="resize-none focus:ring-accent focus:border-accent"
                    />
                    <Button onClick={() => handleCopyText(engagingCaption, "Engaging caption")} variant="outline" size="sm" className="mt-2" disabled={!engagingCaption}>
                        <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="professional-caption" className="text-lg font-semibold text-foreground mb-1 block">Professional Caption</Label>
                    <div className="p-3 bg-muted/50 rounded-md min-h-[100px]">
                        <p id="professional-caption" className="text-sm whitespace-pre-wrap">
                            {professionalCaption || "Not generated."}
                        </p>
                    </div>
                     <Button onClick={() => handleCopyText(professionalCaption, "Professional caption")} variant="outline" size="sm" className="mt-2" disabled={!professionalCaption}>
                        <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="hashtags" className="text-base font-semibold text-foreground mb-1 block">Hashtags</Label>
                    <div className="p-3 bg-muted/50 rounded-md min-h-[60px]">
                        <p id="hashtags" className="text-sm whitespace-pre-wrap">
                            {hashtags || "Not generated."}
                        </p>
                    </div>
                     <Button onClick={() => handleCopyText(hashtags, "Hashtags")} variant="outline" size="sm" className="mt-2" disabled={!hashtags}>
                        <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                </div>
                <div>
                    <Label htmlFor="post-time" className="text-base font-semibold text-foreground mb-1 block">Suggested Post Time</Label>
                     <div className="p-3 bg-muted/50 rounded-md min-h-[60px]">
                        <p id="post-time" className="text-sm">
                            {suggestedPostTime || "Not generated."}
                        </p>
                    </div>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} InstaGenius Pro. All rights reserved.</p>
          <p>Powered by AI magic ✨</p>
        </footer>
      </main>
      <Toaster />
    </>
  );
}
