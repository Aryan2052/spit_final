import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, AlertTriangle, User, Users, Share2, TrendingUp, Target, Building, ArrowUpRight, Video, Image, BarChart } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import VideoGenerator from '@/components/VideoGenerator';
import ImageGenerator from '@/components/ImageGenerator';

const PRMarketing = () => {
  const { 
    latestEventAnalysis, 
    sentimentAnalysis, 
    contentSuggestions, 
    sponsorSuggestions,
    eventName,
    eventType
  } = useEventContext();

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
                        <button className="text-sm text-primary flex items-center">
                          <Share2 className="h-4 w-4 mr-1" /> Share
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
