import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  ThumbsUp, 
  AlertTriangle, 
  User, 
  Users, 
  Share2, 
  TrendingUp, 
  Target, 
  Building, 
  ArrowUpRight, 
  Video, 
  Image, 
  BarChart, 
  Sparkles,
  Facebook,
  Instagram
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import VideoGenerator from '@/components/VideoGenerator';
import ImageGenerator from '@/components/ImageGenerator';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PRMarketing = () => {
  const { 
    latestEventAnalysis, 
    sentimentAnalysis, 
    contentSuggestions, 
    sponsorSuggestions,
    eventName,
    eventType
  } = useEventContext();
  
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [aiContentSuggestions, setAiContentSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Generate content suggestions when an event is selected
  useEffect(() => {
    if (selectedEvent) {
      generateContentSuggestions(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events. Please try again later.');
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    const event = events.find(e => e._id === eventId);
    setSelectedEvent(event);
  };

  const generateContentSuggestions = async (event) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API Key is missing');
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are an expert PR and marketing content strategist. Generate 4 creative content ideas for an event named "${event.name}" with the following details:

Event Description: ${event.description}
Date: ${new Date(event.date).toLocaleDateString()}
Location: ${event.location}
Organizer: ${event.organizer}

For each content idea, provide:
1. A catchy title (max 6 words)
2. Content type (e.g., "Social Media Post", "Email Newsletter", "Press Release", "Blog Article")
3. A brief description (2-3 sentences)
4. Target audience
5. Key message
6. Potential engagement score (a number between 70-95)

Format your response as a JSON array of objects with the following structure:
[
  {
    "title": "Catchy Title",
    "type": "Content Type",
    "description": "Brief description",
    "audience": "Target audience",
    "message": "Key message",
    "score": 85
  },
  ...
]

Be creative, specific, and focus on content that would drive engagement and attendance for this particular event.`;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```|(\[[\s\S]*\])/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[2];
        try {
          const parsedSuggestions = JSON.parse(jsonString);
          
          // Add unique IDs to each suggestion
          const suggestionsWithIds = parsedSuggestions.map((suggestion, index) => ({
            ...suggestion,
            id: `suggestion-${Date.now()}-${index}`
          }));
          
          setAiContentSuggestions(suggestionsWithIds);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          setError('Failed to parse content suggestions. Please try again.');
        }
      } else {
        setError('Failed to generate proper content suggestions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating content suggestions:', error);
      setError(`Failed to generate content suggestions: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to handle social media sharing
  const handleShare = (platform, content) => {
    const text = `${content.title} - ${content.description}`;
    const url = window.location.href;
    
    let shareUrl = '';
    
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct sharing URL like WhatsApp or Facebook
        navigator.clipboard.writeText(text + ' ' + url);
        alert('Content copied to clipboard! Open Instagram to share.');
        shareUrl = 'https://www.instagram.com/';
        break;
      default:
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // New component for AI Insights
  const AIInsightsSection = () => {
    if (!latestEventAnalysis) {
      return (
        <Alert>
          <AlertTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            No Recent Event Analysis
          </AlertTitle>
          <AlertDescription>
            Create a new event in the Event Management page to see AI-generated insights and strategies.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              PR Strategies
            </CardTitle>
            {eventName && (
              <CardDescription>
                <Badge variant="outline">{eventName}</Badge>
                {eventType && (
                  <Badge variant="outline" className="ml-2">{eventType}</Badge>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestEventAnalysis.prStrategies.map((strategy, index) => (
                <div key={index} className="border-l-4 border-primary p-4">
                  <h4 className="font-semibold">{strategy.strategy}</h4>
                  <p className="text-sm text-muted-foreground">{strategy.expectedOutcome}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={strategy.impact === 'High' ? 'destructive' : 
                                 strategy.impact === 'Medium' ? 'default' : 'secondary'}>
                      {strategy.impact} Impact
                    </Badge>
                    <span className="text-xs text-muted-foreground">{strategy.timeline}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Marketing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestEventAnalysis.marketingInsights.map((insight, index) => (
                <div key={index} className="border-l-4 border-secondary p-4">
                  <h4 className="font-semibold">{insight.insight}</h4>
                  <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                  <Badge variant={insight.priority === 'High' ? 'destructive' : 
                               insight.priority === 'Medium' ? 'default' : 'secondary'}>
                    {insight.priority} Priority
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Audience Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Expected Reach</span>
                <span className="font-semibold">{latestEventAnalysis.audienceMetrics.expectedReach.toLocaleString()}</span>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Target Demographics</h4>
                <div className="flex flex-wrap gap-2">
                  {latestEventAnalysis.audienceMetrics.targetDemographic.map((demo, index) => (
                    <Badge key={index} variant="outline">{demo}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Engagement Prediction</span>
                <span className="font-semibold">{latestEventAnalysis.audienceMetrics.engagementPrediction}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">PR & Marketing Dashboard</h2>
            <p className="text-muted-foreground">Real-time insights and AI-driven analytics for your events</p>
            {eventName && (
              <div className="mt-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {eventName}
                </Badge>
                {eventType && (
                  <Badge variant="outline" className="ml-2 text-lg px-3 py-1">
                    {eventType}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <AIInsightsSection />
          
          {/* AI Content Generation Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">AI Content Generation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VideoGenerator />
              <ImageGenerator />
            </div>
          </section>

          {/* AI Content Suggestions Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">AI Content Suggestions</h2>
            
            {/* Event Selection */}
            <div className="mb-8 max-w-md">
              <h3 className="text-lg font-medium mb-3">Generate Content Ideas for Event</h3>
              <div className="flex gap-4">
                <div className="flex-grow">
                  <Select value={selectedEventId} onValueChange={handleEventChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event._id} value={event._id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => selectedEvent && generateContentSuggestions(selectedEvent)}
                  disabled={!selectedEvent || isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Ideas
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
            
            {/* AI Generated Content Suggestions */}
            {aiContentSuggestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {aiContentSuggestions.map((idea) => (
                  <Card key={idea.id} className="glass-card card-3d-effect overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-2 bg-gradient-to-r from-primary to-accent"></div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {idea.score}%
                        </Badge>
                      </div>
                      <CardDescription>{idea.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3 text-muted-foreground">{idea.description}</p>
                      <div className="text-xs text-muted-foreground mb-3">
                        <span className="font-semibold">Audience:</span> {idea.audience}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        <span className="font-semibold">Key Message:</span> {idea.message}
                      </div>
                      <div className="flex justify-between items-center">
                        <button className="text-sm text-primary flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" /> Generate
                        </button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="text-sm text-primary flex items-center">
                              <Share2 className="h-4 w-4 mr-1" /> Share
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => handleShare('whatsapp', idea)}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-green-600" viewBox="0 0 16 16">
                                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                </svg>
                                WhatsApp
                              </button>
                              <button 
                                onClick={() => handleShare('facebook', idea)}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                              >
                                <Facebook className="h-4 w-4 text-blue-600" />
                                Facebook
                              </button>
                              <button 
                                onClick={() => handleShare('instagram', idea)}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                              >
                                <Instagram className="h-4 w-4 text-pink-600" />
                                Instagram
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Original Content Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contentSuggestions && contentSuggestions.length > 0 ? (
                contentSuggestions.map((idea) => (
                  <Card key={idea.id} className="glass-card card-3d-effect overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary to-accent"></div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {idea.score}%
                        </Badge>
                      </div>
                      <CardDescription>{idea.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3 text-muted-foreground">{idea.description}</p>
                      <div className="flex justify-between items-center">
                        <button className="text-sm text-primary flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" /> Generate
                        </button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="text-sm text-primary flex items-center">
                              <Share2 className="h-4 w-4 mr-1" /> Share
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => handleShare('whatsapp', idea)}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-green-600" viewBox="0 0 16 16">
                                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                </svg>
                                WhatsApp
                              </button>
                              <button 
                                onClick={() => handleShare('facebook', idea)}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                              >
                                <Facebook className="h-4 w-4 text-blue-600" />
                                Facebook
                              </button>
                              <button 
                                onClick={() => handleShare('instagram', idea)}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                              >
                                <Instagram className="h-4 w-4 text-pink-600" />
                                Instagram
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Alert>
                    <AlertTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      No Content Suggestions Available
                    </AlertTitle>
                    <AlertDescription>
                      Create a new event in the Event Management page to generate content suggestions.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </section>

          {/* Sentiment Analysis Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Sentiment Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card card-3d-effect">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5 text-primary" />
                    Social Media Engagement
                  </CardTitle>
                  <CardDescription>Engagement metrics for your event</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      No Engagement Data
                    </AlertTitle>
                    <AlertDescription>
                      Create a new event to see engagement predictions.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="glass-card card-3d-effect">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ThumbsUp className="mr-2 h-5 w-5 text-primary" />
                    Sentiment Breakdown
                  </CardTitle>
                  <CardDescription>Overall sentiment analysis{eventName ? ` for ${eventName}` : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                  {sentimentAnalysis ? (
                    <div className="p-4">
                      <div className="grid grid-cols-3 text-center mt-4">
                        <div>
                          <div className="text-2xl font-bold text-green-500">{sentimentAnalysis.positive}%</div>
                          <div className="text-sm text-muted-foreground">Positive</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-500">{sentimentAnalysis.neutral}%</div>
                          <div className="text-sm text-muted-foreground">Neutral</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-500">{sentimentAnalysis.negative}%</div>
                          <div className="text-sm text-muted-foreground">Negative</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        No Sentiment Data
                      </AlertTitle>
                      <AlertDescription>
                        Create a new event to see sentiment analysis.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Sponsor Suggestions */}
          <section>
            <h2 className="text-2xl font-bold mb-6">AI Sponsor Suggestions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sponsorSuggestions && sponsorSuggestions.length > 0 ? (
                sponsorSuggestions.map((sponsor, index) => (
                  <Card key={index} className="glass-card card-3d-effect">
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-full ${sponsor.color} flex items-center justify-center text-white font-bold mr-3`}>
                          {sponsor.logo}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{sponsor.name}</CardTitle>
                          <CardDescription className="text-xs">{sponsor.match}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3 text-muted-foreground">{sponsor.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Building className="h-3 w-3 mr-1" /> {sponsor.industry}
                        </Badge>
                        <button className="text-sm text-primary flex items-center">
                          <ArrowUpRight className="h-4 w-4 mr-1" /> Contact
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Alert>
                    <AlertTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      No Sponsor Suggestions Available
                    </AlertTitle>
                    <AlertDescription>
                      Create a new event in the Event Management page to generate sponsor suggestions.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PRMarketing;
