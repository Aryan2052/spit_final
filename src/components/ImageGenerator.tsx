import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ImageGenerator = () => {
  const { imageGeneration, updateImageGenerationState } = useEventContext();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Function to query the Hugging Face API
  const queryStableDiffusion = async (prompt: string) => {
    try {
      const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      
      if (!HF_API_KEY) {
        throw new Error("Hugging Face API key is missing");
      }
      
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/stable-diffusion-v1-5/stable-diffusion-v1-5",
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.blob();
      return URL.createObjectURL(result);
    } catch (error) {
      console.error("Error calling Hugging Face API:", error);
      throw error;
    }
  };

  // Function to generate a fallback image when API fails
  const generateFallbackImage = (prompt: string) => {
    // Use Picsum Photos for reliable image generation
    // Generate a seed based on the prompt text
    const promptSum = prompt.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    // Use the seed to generate a consistent image ID between 1 and 1000
    const imageId = (promptSum % 1000) + 1;
    
    // Create the image URL with the timestamp to avoid caching
    const timestamp = Date.now();
    return `https://picsum.photos/seed/${imageId}/800/600?t=${timestamp}`;
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for the image');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setUsedFallback(false);
      
      let imageUrl;
      
      try {
        // Try to use the Hugging Face API first
        imageUrl = await queryStableDiffusion(prompt);
      } catch (apiError) {
        console.warn("Falling back to sample images due to API error:", apiError);
        // If the API fails, use the fallback method
        imageUrl = generateFallbackImage(prompt);
        setUsedFallback(true);
      }
      
      setGeneratedImageUrl(imageUrl);
      
      // Update the context with the generated image
      updateImageGenerationState({
        imageUrl,
        prompt,
        isLoading: false,
        error: null
      });
      
      // Show a notice if we used the fallback
      if (usedFallback) {
        setError(`Note: Using demo mode with sample images due to API limitations. Each prompt will generate a different image based on your input.`);
      }
      
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      updateImageGenerationState({
        error: err instanceof Error ? err.message : 'Failed to generate image',
        isLoading: false
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card card-3d-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          AI Image Generator
        </CardTitle>
        <CardDescription>
          Generate promotional images for your event using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe the image you want to generate (e.g., 'A professional networking event with people exchanging business cards')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
            disabled={isGenerating}
          />
        </div>
        
        {error && (
          <Alert variant={error.includes('demo') ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{error.includes('demo') ? 'Notice' : 'Error'}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {generatedImageUrl && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Generated Image</h3>
            <img 
              className="w-full rounded-md border border-input"
              src={generatedImageUrl}
              alt="AI generated promotional image"
            />
            {usedFallback && (
              <p className="text-xs text-muted-foreground mt-2">
                This is a sample image. For custom AI-generated images, please check your API key or try again later.
              </p>
            )}
          </div>
        )}
        
        <Button 
          onClick={handleGenerateImage} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageGenerator;
