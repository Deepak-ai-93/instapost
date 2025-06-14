
"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { generatePostDetails, type GeneratePostDetailsOutput } from "@/ai/flows/generate-post-details";
import { generateImageFromPrompt, type GenerateImageFromPromptInput } from "@/ai/flows/generate-image-from-prompt";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Copy, Sparkles, Image as ImageIcon, Wand2, Palette, FileText, Info, Edit3, Edit, Building, Phone, LinkIcon, MessageSquareQuote } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InstaGeniusPage() {
  const [userNiche, setUserNiche] = useState<string>("");
  const [userCategory, setUserCategory] = useState<string>("");
  const [userImageDescription, setUserImageDescription] = useState<string>("");
  const [userLogoImageUrl, setUserLogoImageUrl] = useState<string>("");
  const [userContactInfoDescription, setUserContactInfoDescription] = useState<string>("");
  const [userHookThreadStyleDescription, setUserHookThreadStyleDescription] = useState<string>("");
  const [userEditInstruction, setUserEditInstruction] = useState<string>("");
  
  const [engagingCaption, setEngagingCaption] = useState<string>("");
  const [professionalCaption, setProfessionalCaption] = useState<string>("");
  const [hashtags, setHashtags] = useState<string>("");
  const [suggestedPostTime, setSuggestedPostTime] = useState<string>("");
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState<string>("");
  const [generatedImageDataUris, setGeneratedImageDataUris] = useState<string[]>([]);
  const [headlineText, setHeadlineText] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const resetAllContent = () => {
    setUserNiche("");
    setUserCategory("");
    setUserImageDescription("");
    setUserLogoImageUrl("");
    setUserContactInfoDescription("");
    setUserHookThreadStyleDescription("");
    setUserEditInstruction("");
    setEngagingCaption("");
    setProfessionalCaption("");
    setHashtags("");
    setSuggestedPostTime("");
    setImageGenerationPrompt("");
    setGeneratedImageDataUris([]);
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
    setEngagingCaption("");
    setProfessionalCaption("");
    setHashtags("");
    setSuggestedPostTime("");
    setImageGenerationPrompt("");
    setGeneratedImageDataUris([]);
    setHeadlineText("");
    setUserEditInstruction("");

    try {
      setCurrentLoadingStep("Generating post details...");
      const detailsResult = await generatePostDetails({ 
        userNiche, 
        userCategory,
        userImageDescription: userImageDescription.trim() || undefined,
        userLogoImageUrl: userLogoImageUrl.trim() || undefined,
        userContactInfoDescription: userContactInfoDescription.trim() || undefined,
        userHookThreadStyleDescription: userHookThreadStyleDescription.trim() || undefined,
      });
      setEngagingCaption(detailsResult.engagingCaption);
      setProfessionalCaption(detailsResult.professionalCaption);
      setHashtags(detailsResult.hashtags);
      setSuggestedPostTime(detailsResult.suggestedPostTime);
      setImageGenerationPrompt(detailsResult.imageGenerationPrompt);
      setHeadlineText(detailsResult.headlineText);

      if (detailsResult.imageGenerationPrompt) {
        setCurrentLoadingStep("Generating AI image (this may take a moment)...");
        try {
          const imageGenInput: GenerateImageFromPromptInput = { prompt: detailsResult.imageGenerationPrompt };
          if (detailsResult.logoImageUrlForImageGen) {
            imageGenInput.logoImageUrl = detailsResult.logoImageUrlForImageGen;
          }
          const imageResult = await generateImageFromPrompt(imageGenInput);
          setGeneratedImageDataUris(imageResult.imageDataUris); 
          toast({ title: "Success!", description: `AI content and image generated.` });
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

  const handleApplyImageEdits = async () => {
    if (generatedImageDataUris.length === 0 || !generatedImageDataUris[0]) {
      setError("No image to edit. Please generate an image first.");
      toast({ variant: "destructive", title: "Error", description: "No image to edit." });
      return;
    }
    if (!userEditInstruction.trim()) {
      setError("Please enter an edit instruction.");
      toast({ variant: "destructive", title: "Error", description: "Please enter an edit instruction." });
      return;
    }
    setIsEditingImage(true);
    setError(null);
    try {
      setCurrentLoadingStep("Applying image edits...");
      const baseImageToEdit = generatedImageDataUris[0];
      const imageEditInput: GenerateImageFromPromptInput = {
        baseImageDataUri: baseImageToEdit,
        editInstruction: userEditInstruction,
      };
      if (userLogoImageUrl.trim()) { 
        imageEditInput.logoImageUrl = userLogoImageUrl.trim();
      }
      const imageResult = await generateImageFromPrompt(imageEditInput);
      setGeneratedImageDataUris(imageResult.imageDataUris); 
      toast({ title: "Success!", description: "Image edits applied. New image generated." });
      setUserEditInstruction(""); 
    } catch (err) {
      console.error("Failed to apply image edits:", err);
      setError("Failed to apply image edits. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to apply image edits." });
    } finally {
      setIsEditingImage(false);
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
  
  const handleDownloadGeneratedImage = (imageDataUri: string) => {
    if (imageDataUri) {
      downloadDataUri(imageDataUri, `ai_img_${userNiche.replace(/\s+/g, '_')}_${userCategory.replace(/\s+/g, '_')}.png`);
      toast({ title: "Success", description: `AI generated image download started!` });
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

  const hasGeneratedContent = engagingCaption || professionalCaption || hashtags || suggestedPostTime || generatedImageDataUris.length > 0 || imageGenerationPrompt || headlineText;
  const canGenerate = userNiche.trim() && userCategory.trim();
  const currentGeneratedImage = generatedImageDataUris.length > 0 ? generatedImageDataUris[0] : null;

  return (
    <>
      <div className="flex flex-col items-center min-h-screen bg-background py-0">
        <header className="mb-10 text-center w-full">
          <div className="flex items-center justify-center mb-2">
            <Wand2 className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-5xl font-bold text-primary">InstaGenius Pro</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Craft compelling Instagram posts: AI-driven content, image generation & interactive editing!
          </p>
        </header>

        <Card className="w-full max-w-3xl shadow-xl rounded-xl overflow-hidden mb-8">
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-6 w-6 text-primary" /> Define Your Content Focus</CardTitle>
            <CardDescription>Enter niche, category, and optionally describe your image, branding, and hook styles. AI will generate content and an image. You can then edit the image.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="niche-input" className="text-lg font-semibold text-foreground mb-2 block">
                  Niche*
                </Label>
                <Input
                  id="niche-input"
                  type="text"
                  value={userNiche}
                  onChange={(e) => setUserNiche(e.target.value)}
                  placeholder="e.g., Sustainable Travel"
                  className="focus:ring-accent focus:border-accent text-base"
                  required
                  disabled={isLoading || isEditingImage}
                />
                <p className="text-xs text-muted-foreground mt-1">The specific topic or theme.</p>
              </div>
              <div>
                <Label htmlFor="category-input" className="text-lg font-semibold text-foreground mb-2 block">
                  Category*
                </Label>
                <Input
                  id="category-input"
                  type="text"
                  value={userCategory}
                  onChange={(e) => setUserCategory(e.target.value)}
                  placeholder="e.g., Eco-tourism Tips"
                  className="focus:ring-accent focus:border-accent text-base"
                  required
                  disabled={isLoading || isEditingImage}
                />
                <p className="text-xs text-muted-foreground mt-1">The broader classification.</p>
              </div>
            </div>

            <div>
                <Label htmlFor="image-description-input" className="text-lg font-semibold text-foreground mb-2 block flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-primary" /> Describe Desired Image (Optional)
                </Label>
                <Textarea
                  id="image-description-input"
                  value={userImageDescription}
                  onChange={(e) => setUserImageDescription(e.target.value)}
                  placeholder="e.g., Modern design, sleek, minimalist aesthetic. A vintage map background with passport stamps, vibrant teal and orange colors. Text 'Adventure Awaits' in bold script font at the top center. Photorealistic style, impressionistic, abstract..."
                  rows={3}
                  className="focus:ring-accent focus:border-accent text-base resize-none"
                  disabled={isLoading || isEditingImage}
                />
                <p className="text-xs text-muted-foreground mt-1">Specify elements, colors, text style/position, overall aesthetic. AI will enhance this.</p>
            </div>
            
            <div>
              <Label htmlFor="hook-thread-style-input" className="text-lg font-semibold text-foreground mb-2 block flex items-center">
                <MessageSquareQuote className="h-5 w-5 mr-2 text-primary" /> Hook/Thread Visual Style (Optional)
              </Label>
              <Textarea
                id="hook-thread-style-input"
                value={userHookThreadStyleDescription}
                onChange={(e) => setUserHookThreadStyleDescription(e.target.value)}
                placeholder="e.g., 'Make the headline hook large and centered at top', 'Subtle visual cues for a thread, like unfolding elements', 'Bold, playful font for hook text'"
                rows={2}
                className="focus:ring-accent focus:border-accent text-base resize-none"
                disabled={isLoading || isEditingImage}
              />
              <p className="text-xs text-muted-foreground mt-1">Describe visual style/position for hooks or thread elements on the image.</p>
            </div>

            <div className="space-y-4">
                <Label className="text-lg font-semibold text-foreground mb-2 block">
                    Branding & Contact (Optional - AI will try to incorporate these)
                </Label>
                 <Alert variant="default" className="p-3">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="text-sm font-medium">Experimental Feature</AlertTitle>
                    <AlertDescription className="text-xs">
                        AI attempts to incorporate logo/contact info ideas into the image design. Referencing external logo URLs for direct inclusion by AI can be unreliable.
                    </AlertDescription>
                </Alert>

                <div>
                    <Label htmlFor="logo-url-input" className="text-sm font-medium text-foreground mb-1 block flex items-center">
                        <LinkIcon className="h-4 w-4 mr-1 text-primary/80" /> Logo Image URL (Optional)
                    </Label>
                    <Input
                        id="logo-url-input"
                        type="url"
                        value={userLogoImageUrl}
                        onChange={(e) => setUserLogoImageUrl(e.target.value)}
                        placeholder="https://example.com/your-logo.png"
                        className="text-sm"
                        disabled={isLoading || isEditingImage}
                    />
                     {userLogoImageUrl && (
                        <p className="text-xs text-muted-foreground mt-1">AI will attempt to reference this logo URL.</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="contact-info-input" className="text-sm font-medium text-foreground mb-1 block flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-primary/80" /> Contact Info Ideas (Text)
                    </Label>
                    <Input
                        id="contact-info-input"
                        value={userContactInfoDescription}
                        onChange={(e) => setUserContactInfoDescription(e.target.value)}
                        placeholder="e.g., Icons for phone/email at bottom"
                        className="text-sm"
                        disabled={isLoading || isEditingImage}
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Describe how AI should consider these text-based elements or the logo URL in the image design (e.g., stylized icons, placeholder areas, stylistic alignment).</p>
            </div>
            
            <div className="pt-2">
                <div className="flex space-x-2">
                    <Button
                        onClick={handleGenerateContent}
                        disabled={!canGenerate || isLoading || isEditingImage}
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
                      disabled={(isLoading || isEditingImage) && !userNiche && !userCategory && !userImageDescription && !userLogoImageUrl && !userContactInfoDescription && !userHookThreadStyleDescription && !hasGeneratedContent && !userEditInstruction}
                    >
                        Clear All
                    </Button>
                </div>
                {error && !isLoading && !isEditingImage && <p className="text-sm text-destructive mt-2">{error}</p>}
            </div>
          </CardContent>
        </Card>

        {(isLoading || isEditingImage) && (currentLoadingStep.includes("Generating AI image") || currentLoadingStep.includes("Applying image edits")) && (
            <Card className="w-full max-w-4xl shadow-xl rounded-xl overflow-hidden mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {currentLoadingStep.includes("Applying image edits") ? <Edit3 className="mr-2 h-6 w-6 text-primary" /> : <Palette className="mr-2 h-6 w-6 text-primary" />}
                        {currentLoadingStep.includes("Applying image edits") ? "Applying Image Edits" : "AI Image Generation in Progress"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-10 text-center">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-accent" />
                    <p className="text-lg text-muted-foreground">
                        {currentLoadingStep.includes("Applying image edits") ? "Regenerating image with your edits..." : "Creating your unique AI image..."}
                        This may take a moment.
                    </p>
                    {currentLoadingStep.includes("Generating AI image") && imageGenerationPrompt && <p className="text-sm text-muted-foreground mt-1">Using base prompt: "{imageGenerationPrompt.substring(0,100)}..."</p>}
                </CardContent>
            </Card>
        )}

        {hasGeneratedContent && !isLoading && !isEditingImage && (
          <Card className="w-full max-w-5xl shadow-xl rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center"><Sparkles className="mr-2 h-6 w-6 text-accent" /> AI Enhanced Content for "{userNiche}" ({userCategory})</CardTitle>
              <CardDescription>Review your AI-generated content. The headline is "{headlineText}". You can download the image or edit it.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 space-y-8">
              
              {currentGeneratedImage && (
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground block flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-primary" /> AI Generated Image
                  </Label>
                   <Alert variant="default" className="p-3">
                        <Info className="h-5 w-5" />
                        <AlertDescription className="text-xs">
                            AI has attempted to incorporate your branding ideas. Referencing external logo URLs for direct inclusion by AI can be unreliable. Results can vary.
                        </AlertDescription>
                    </Alert>
                  <div className="w-full md:w-2/3 lg:w-1/2 mx-auto space-y-2">
                      <div className="aspect-square border-2 border-dashed border-accent rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden relative group">
                        <NextImage
                          src={currentGeneratedImage}
                          alt={`AI generated image for ${userNiche} - ${userCategory}`}
                          layout="fill"
                          objectFit="contain"
                          data-ai-hint={`${userNiche.split(" ")[0] || ""} ${userCategory.split(" ")[0] || ""}`.trim()}
                        />
                      </div>
                      <Button
                        onClick={() => handleDownloadGeneratedImage(currentGeneratedImage)}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download Image
                      </Button>
                  </div>
                   <Separator />
                </div>
              )}

              {currentGeneratedImage && (
                 <div>
                    <Label htmlFor="edit-instruction-input" className="text-md font-semibold text-foreground mb-2 block flex items-center">
                      <Edit className="h-5 w-5 mr-2 text-primary" /> Edit Generated Image
                    </Label>
                    <Textarea
                      id="edit-instruction-input"
                      value={userEditInstruction}
                      onChange={(e) => setUserEditInstruction(e.target.value)}
                      placeholder="e.g., Change text color to blue, make background darker, adjust logo position..."
                      rows={3}
                      className="focus:ring-accent focus:border-accent text-sm resize-none"
                      disabled={isEditingImage || isLoading}
                    />
                      <Button
                        onClick={handleApplyImageEdits}
                        disabled={!userEditInstruction.trim() || isEditingImage || isLoading || !currentGeneratedImage}
                        className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isEditingImage ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <Edit3 className="h-5 w-5 mr-2" />
                        )}
                        {isEditingImage ? currentLoadingStep : "Apply Edits & Regenerate Image"}
                      </Button>
                      {error && isEditingImage && <p className="text-sm text-destructive mt-2">{error}</p>}
                  </div>
              )}
              
              {currentGeneratedImage && <Separator />}

              <div className="grid md:grid-cols-2 gap-8 items-start">
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
                      disabled={isLoading || isEditingImage}
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

                <div className="space-y-6">
                   {imageGenerationPrompt && (
                    <div className="p-3 bg-muted/50 rounded-md">
                        <Label className="text-xs text-foreground font-medium block mb-1">Base Image Prompt (Enhanced by AI):</Label>
                        <p className="text-xs text-muted-foreground break-words">
                           {imageGenerationPrompt}
                        </p>
                         <Button onClick={() => handleCopyText(imageGenerationPrompt, "Image prompt")} variant="link" size="sm" className="text-xs p-0 h-auto mt-1" disabled={!imageGenerationPrompt}>
                            <Copy className="h-3 w-3 mr-1" /> Copy Prompt
                        </Button>
                    </div>
                   )}
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
              </div>
            </CardContent>
          </Card>
        )}

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} InstaGenius Pro. All rights reserved.</p>
          <p>Powered by AI magic ✨</p>
        </footer>
      </div>
    </>
  );
}

    