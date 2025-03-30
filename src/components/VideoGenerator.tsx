import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Video, AlertCircle, Share2, Facebook, Instagram } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InferenceClient } from "@huggingface/inference";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  // Function to handle sharing content
  const handleShare = (platform: string, videoUrl: string) => {
    if (!videoUrl) return;
    
    let shareUrl = '';
    const text = encodeURIComponent(`Check out this AI-generated promotional video for our event!`);
    const contentUrl = encodeURIComponent(videoUrl);
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text} ${contentUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${contentUrl}&quote=${text}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct sharing URL, so we'll just copy to clipboard
        navigator.clipboard.writeText(`${text} ${videoUrl}`);
        alert('Video URL copied to clipboard! Open Instagram to share.');
        return;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
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
                      onClick={() => handleShare('whatsapp', generatedVideoUrl)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-green-600" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                      </svg>
                      WhatsApp
                    </button>
                    <button 
                      onClick={() => handleShare('facebook', generatedVideoUrl)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                    >
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </button>
                    <button 
                      onClick={() => handleShare('instagram', generatedVideoUrl)}
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
