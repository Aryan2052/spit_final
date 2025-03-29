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

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for the image');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      // Use Picsum Photos for reliable image generation
      // Generate a seed based on the prompt text
      const promptSum = prompt.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      
      // Use the seed to generate a consistent image ID between 1 and 1000
      const imageId = (promptSum % 1000) + 1;
      
      // Create the image URL with the timestamp to avoid caching
      const timestamp = Date.now();
      const imageUrl = `https://picsum.photos/seed/${imageId}/800/600?t=${timestamp}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGeneratedImageUrl(imageUrl);
      
      // Update the context with the generated image
      updateImageGenerationState({
        imageUrl,
        prompt,
        isLoading: false,
        error: null
      });
      
      // Show a notice about using demo mode
      setError(`Note: Using demo mode with sample images. Each prompt will generate a different image based on your input.`);
      
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
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setPrompt('');
            setGeneratedImageUrl(null);
            setError(null);
            updateImageGenerationState({
              imageUrl: null,
              prompt: '',
              error: null
            });
          }}
          disabled={isGenerating}
        >
          Clear
        </Button>
        <Button 
          onClick={handleGenerateImage}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : 'Generate Image'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ImageGenerator;
