import React, { createContext, useContext, useState, useEffect } from 'react';

export type EventAnalysis = {
  prStrategies: Array<{
    strategy: string;
    impact: 'Low' | 'Medium' | 'High';
    timeline: string;
    expectedOutcome: string;
  }>;
  marketingInsights: Array<{
    insight: string;
    recommendation: string;
    priority: 'Low' | 'Medium' | 'High';
  }>;
  audienceMetrics: {
    expectedReach: number;
    targetDemographic: string[];
    engagementPrediction: number;
  };
  timestamp: string;
};

export type SentimentAnalysis = {
  positive: number;
  neutral: number;
  negative: number;
};

export type ContentSuggestion = {
  id: number;
  title: string;
  type: string;
  score: number;
  description: string;
};

export type SponsorSuggestion = {
  name: string;
  match: string;
  logo: string;
  color: string;
  description: string;
  industry: string;
};

export type VideoGenerationState = {
  isLoading: boolean;
  videoUrl: string | null;
  error: string | null;
  prompt: string;
};

export type ImageGenerationState = {
  isLoading: boolean;
  imageUrl: string | null;
  error: string | null;
  prompt: string;
};

type EventContextType = {
  latestEventAnalysis: EventAnalysis | null;
  updateEventAnalysis: (analysis: EventAnalysis) => void;
  sentimentAnalysis: SentimentAnalysis;
  updateSentimentAnalysis: (analysis: SentimentAnalysis) => void;
  contentSuggestions: ContentSuggestion[];
  updateContentSuggestions: (suggestions: ContentSuggestion[]) => void;
  sponsorSuggestions: SponsorSuggestion[];
  updateSponsorSuggestions: (suggestions: SponsorSuggestion[]) => void;
  eventName: string;
  updateEventName: (name: string) => void;
  eventType: string;
  updateEventType: (type: string) => void;
  videoGeneration: VideoGenerationState;
  updateVideoGenerationState: (state: Partial<VideoGenerationState>) => void;
  generateVideo: (prompt: string) => Promise<void>;
  imageGeneration: ImageGenerationState;
  updateImageGenerationState: (state: Partial<ImageGenerationState>) => void;
  generateImage: (prompt: string) => Promise<void>;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latestEventAnalysis, setLatestEventAnalysis] = useState<EventAnalysis | null>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis>({
    positive: 65,
    neutral: 25,
    negative: 10
  });
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([]);
  const [sponsorSuggestions, setSponsorSuggestions] = useState<SponsorSuggestion[]>([]);
  const [eventName, setEventName] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [videoGeneration, setVideoGeneration] = useState<VideoGenerationState>({
    isLoading: false,
    videoUrl: null,
    error: null,
    prompt: ''
  });
  const [imageGeneration, setImageGeneration] = useState<ImageGenerationState>({
    isLoading: false,
    imageUrl: null,
    error: null,
    prompt: ''
  });

  const updateEventAnalysis = (analysis: EventAnalysis) => {
    setLatestEventAnalysis(analysis);
  };

  const updateSentimentAnalysis = (analysis: SentimentAnalysis) => {
    setSentimentAnalysis(analysis);
  };

  const updateContentSuggestions = (suggestions: ContentSuggestion[]) => {
    setContentSuggestions(suggestions);
  };

  const updateSponsorSuggestions = (suggestions: SponsorSuggestion[]) => {
    setSponsorSuggestions(suggestions);
  };

  const updateEventName = (name: string) => {
    setEventName(name);
  };

  const updateEventType = (type: string) => {
    setEventType(type);
  };

  const updateVideoGenerationState = (state: Partial<VideoGenerationState>) => {
    setVideoGeneration(prev => ({ ...prev, ...state }));
  };

  const updateImageGenerationState = (state: Partial<ImageGenerationState>) => {
    setImageGeneration(prev => ({ ...prev, ...state }));
  };

  const generateVideo = async (prompt: string) => {
    try {
      updateVideoGenerationState({ isLoading: true, error: null, prompt });

      // This would be implemented with actual API call in a real application
      // For now, we'll simulate the API call with a timeout

      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success response
      updateVideoGenerationState({
        isLoading: false,
        videoUrl: 'https://example.com/generated-video.mp4'
      });
    } catch (error) {
      console.error('Error generating video:', error);
      updateVideoGenerationState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate video'
      });
    }
  };

  const generateImage = async (prompt: string) => {
    try {
      updateImageGenerationState({ isLoading: true, error: null, prompt });

      // This would be implemented with actual API call in a real application
      // For now, we'll simulate the API call with a timeout

      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success response
      updateImageGenerationState({
        isLoading: false,
        imageUrl: 'https://example.com/generated-image.jpg'
      });
    } catch (error) {
      console.error('Error generating image:', error);
      updateImageGenerationState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate image'
      });
    }
  };

  return (
    <EventContext.Provider value={{
      latestEventAnalysis,
      updateEventAnalysis,
      sentimentAnalysis,
      updateSentimentAnalysis,
      contentSuggestions,
      updateContentSuggestions,
      sponsorSuggestions,
      updateSponsorSuggestions,
      eventName,
      updateEventName,
      eventType,
      updateEventType,
      videoGeneration,
      updateVideoGenerationState,
      generateVideo,
      imageGeneration,
      updateImageGenerationState,
      generateImage
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
