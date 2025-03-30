import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon, AlertCircle, Share2, Facebook, Instagram } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  // Function to handle sharing content
  const handleShare = (platform: string, imageUrl: string) => {
    if (!imageUrl) return;
    
    let shareUrl = '';
    const text = encodeURIComponent(`Check out this AI-generated promotional image for our event!`);
    const contentUrl = encodeURIComponent(imageUrl);
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text} ${contentUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${contentUrl}&quote=${text}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct sharing URL, so we'll just copy to clipboard
        navigator.clipboard.writeText(`${text} ${imageUrl}`);
        alert('Image URL copied to clipboard! Open Instagram to share.');
        return;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
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
            
            {/* Share Button */}
            <div className="flex justify-end mt-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleShare('whatsapp', generatedImageUrl)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-green-600" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                      </svg>
                      WhatsApp
                    </button>
                    <button 
                      onClick={() => handleShare('facebook', generatedImageUrl)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                    >
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </button>
                    <button 
                      onClick={() => handleShare('instagram', generatedImageUrl)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                    >
                      <Instagram className="h-4 w-4 text-pink-600" />
                      Instagram
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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
