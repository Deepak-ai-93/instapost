
"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { generateInstagramCaption } from "@/ai/flows/generate-instagram-caption";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, UploadCloud, Download, Copy, Sparkles, Image as ImageIcon, Scissors } from "lucide-react";

export default function InstaGeniusPage() {
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (uploadedImageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(uploadedImageFile);
    } else {
      setImagePreviewUrl(null);
    }
  }, [uploadedImageFile]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImageFile(file);
      setCaption("");
      setError(null);
    }
  };

  const handleGenerateCaption = async () => {
    if (!imagePreviewUrl) {
      setError("Please upload an image first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateInstagramCaption({ photoDataUri: imagePreviewUrl });
      setCaption(result.caption);
    } catch (err) {
      console.error("Failed to generate caption:", err);
      setError("Failed to generate caption. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to generate caption." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (uploadedImageFile) {
      const url = URL.createObjectURL(uploadedImageFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = uploadedImageFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Image download started!" });
    }
  };

  const handleCopyCaption = async () => {
    if (caption) {
      try {
        await navigator.clipboard.writeText(caption);
        toast({ title: "Success", description: "Caption copied to clipboard!" });
      } catch (err) {
        console.error("Failed to copy caption: ", err);
        toast({ variant: "destructive", title: "Error", description: "Failed to copy caption." });
      }
    }
  };

  const handleClearImage = () => {
    setUploadedImageFile(null);
    setImagePreviewUrl(null);
    setCaption("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen bg-background">
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-5xl font-bold text-primary">InstaGenius</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Generate captivating Instagram posts with AI
          </p>
        </header>

        <Card className="w-full max-w-4xl shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-6 sm:p-10">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Image Upload & Preview */}
              <div className="space-y-6 flex flex-col">
                <div>
                  <Label htmlFor="image-upload" className="text-lg font-semibold text-foreground mb-2 block">
                    Upload Your Image
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor="image-upload"
                      className="flex-grow cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <UploadCloud className="h-5 w-5 mr-2" />
                      Select Image
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                    />
                    {uploadedImageFile && (
                       <Button variant="outline" size="icon" onClick={handleClearImage} aria-label="Clear image">
                         <Scissors className="h-5 w-5" />
                       </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB.</p>
                </div>

                <div className="aspect-[4/3] border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden relative group">
                  {imagePreviewUrl ? (
                    <NextImage
                      src={imagePreviewUrl}
                      alt="Image preview"
                      layout="fill"
                      objectFit="contain"
                      data-ai-hint="user uploaded content"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">Your image will appear here</p>
                      <p className="text-sm">Upload an image to get started</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Caption & Actions */}
              <div className="space-y-6 flex flex-col">
                <div>
                  <Label htmlFor="caption" className="text-lg font-semibold text-foreground mb-2 block">
                    AI Generated Caption
                  </Label>
                  <Button
                    onClick={handleGenerateCaption}
                    disabled={!imagePreviewUrl || isLoading}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mb-3"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-5 w-5 mr-2" />
                    )}
                    {isLoading ? "Generating..." : "Generate Caption"}
                  </Button>
                  <Textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Your AI-generated caption will appear here. Feel free to edit it!"
                    rows={8}
                    className="resize-none focus:ring-accent focus:border-accent"
                  />
                  {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                   <h3 className="text-lg font-semibold text-foreground">Download Your Content</h3>
                  <Button
                    onClick={handleDownloadImage}
                    disabled={!imagePreviewUrl}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download Image
                  </Button>
                  <Button
                    onClick={handleCopyCaption}
                    disabled={!caption}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="h-5 w-5 mr-2" />
                    Copy Caption
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} InstaGenius. All rights reserved.</p>
          <p>Powered by AI magic ✨</p>
        </footer>
      </main>
      <Toaster />
    </>
  );
}
