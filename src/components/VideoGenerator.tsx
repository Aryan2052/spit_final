import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Video, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InferenceClient } from "@huggingface/inference";

const VideoGenerator = () => {
  const { videoGeneration, updateVideoGenerationState, generateVideo } = useEventContext();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Function to query the Hugging Face API for text-to-video generation
  const generateVideoWithHuggingFace = async (prompt: string) => {
    try {
      const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      
      if (!HF_API_KEY) {
        throw new Error("Hugging Face API key is missing");
      }
      
      const client = new InferenceClient(HF_API_KEY);
      
      // Use the Wan-AI/Wan2.1-T2V-14B model for text-to-video generation
      const videoBlob = await client.textToVideo({
        provider: "replicate",
        model: "Wan-AI/Wan2.1-T2V-14B",
        inputs: prompt,
      });
      
      // Create a URL for the video blob
      return URL.createObjectURL(videoBlob);
    } catch (error) {
      console.error("Error calling Hugging Face API for video generation:", error);
      throw error;
    }
  };

  // Function to generate a fallback video when API fails
  const generateFallbackVideo = (prompt: string) => {
    // Fallback videos - using these directly due to API credit limits
    const fallbackVideos = [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    ];
    
    // Use the prompt string to deterministically select a video
    const promptSum = prompt.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const videoIndex = promptSum % fallbackVideos.length;
    return fallbackVideos[videoIndex];
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for the video');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setUsedFallback(false);
      
      let videoUrl;
      
      try {
        // Try to use the Hugging Face API first
        videoUrl = await generateVideoWithHuggingFace(prompt);
      } catch (apiError) {
        console.warn("Falling back to sample videos due to API error:", apiError);
        // If the API fails, use the fallback method
        videoUrl = generateFallbackVideo(prompt);
        setUsedFallback(true);
      }
      
      setGeneratedVideoUrl(videoUrl);
      
      // Update the context with the generated video
      updateVideoGenerationState({
        videoUrl,
        prompt,
        isLoading: false,
        error: null
      });
      
      // Show a notice if we used the fallback
      if (usedFallback) {
        setError(`Note: Using demo mode with sample videos due to API limitations. Each prompt will generate a different video based on your input.`);
      }
      
    } catch (err) {
      console.error('Error generating video:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate video');
      updateVideoGenerationState({
        error: err instanceof Error ? err.message : 'Failed to generate video',
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
          <Video className="h-5 w-5 text-primary" />
          AI Video Generator
        </CardTitle>
        <CardDescription>
          Generate promotional videos for your event using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe the video you want to generate (e.g., 'A young professional walking through a tech conference with excited attendees in the background')"
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
        
        {generatedVideoUrl && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Generated Video</h3>
            <video 
              controls 
              className="w-full rounded-md border border-input"
              src={generatedVideoUrl}
            >
              Your browser does not support the video tag.
            </video>
            {usedFallback && (
              <p className="text-xs text-muted-foreground mt-2">
                This is a sample video. For custom AI-generated videos, please check your API key or try again later.
              </p>
            )}
          </div>
        )}
        
        <Button 
          onClick={handleGenerateVideo} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Video'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoGenerator;
