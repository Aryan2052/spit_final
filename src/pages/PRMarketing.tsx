import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, Line, Bar, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, AlertTriangle, User, Users, Share2, TrendingUp, Target, Building, ArrowUpRight, Video } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import VideoGenerator from '@/components/VideoGenerator';

const PRMarketing = () => {
  const { 
    latestEventAnalysis, 
    sentimentAnalysis, 
    contentSuggestions, 
    sponsorSuggestions,
    eventName,
    eventType
  } = useEventContext();

  // Sample data for engagement metrics
  const engagementData = [
    { day: 'Mon', posts: 5, engagement: 120, reach: 1200 },
    { day: 'Tue', posts: 3, engagement: 80, reach: 900 },
    { day: 'Wed', posts: 7, engagement: 200, reach: 2100 },
    { day: 'Thu', posts: 4, engagement: 150, reach: 1800 },
    { day: 'Fri', posts: 6, engagement: 220, reach: 2400 },
    { day: 'Sat', posts: 2, engagement: 90, reach: 1100 },
    { day: 'Sun', posts: 1, engagement: 40, reach: 600 },
  ];

  // Format sentiment data for the pie chart
  const sentimentData = [
    { name: 'Positive', value: sentimentAnalysis?.positive || 65, color: '#22c55e' },
    { name: 'Neutral', value: sentimentAnalysis?.neutral || 25, color: '#3b82f6' },
    { name: 'Negative', value: sentimentAnalysis?.negative || 10, color: '#ef4444' },
  ];

  // Default content suggestions if none are provided from context
  const defaultContentIdeas = [
    { id: 1, title: "Eco-Friendly Campus Initiative", type: "Campaign", score: 92, description: "Launch a campus-wide sustainability campaign." },
    { id: 2, title: "Student Leaders Spotlight", type: "Article Series", score: 88, description: "Feature stories of student leaders and their impact." },
    { id: 3, title: "Finals Week Survival Guide", type: "Infographic", score: 85, description: "Tips and resources for students during finals week." },
    { id: 4, title: "Campus Hidden Gems", type: "Video Series", score: 82, description: "Explore lesser-known campus facilities and features." },
  ];

  // Default sponsor suggestions if none are provided from context
  const defaultSponsors = [
    {
      name: "Tech Solutions Inc.",
      match: "High match - tech events",
      logo: "TS",
      color: "bg-blue-500",
      description: "Leading provider of innovative technology solutions.",
      industry: "Technology"
    },
    {
      name: "Eco Campus Initiative",
      match: "Good match - sustainability",
      logo: "EC",
      color: "bg-green-500",
      description: "Promoting sustainable practices on campus.",
      industry: "Environment"
    },
    {
      name: "Campus Eats Delivery",
      match: "High match - student services",
      logo: "CE",
      color: "bg-orange-500",
      description: "Food delivery service for campus events.",
      industry: "Food Service"
    },
    {
      name: "University Credit Union",
      match: "Good match - student finance",
      logo: "UC",
      color: "bg-purple-500",
      description: "Financial services for the university community.",
      industry: "Finance"
    },
  ];

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
          
          {/* AI Video Generator Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">AI Video Generator</h2>
            <div className="grid grid-cols-1 gap-6">
              <VideoGenerator />
            </div>
          </section>

          {/* AI Content Generation Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">AI Content Suggestions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(contentSuggestions && contentSuggestions.length > 0 ? contentSuggestions : defaultContentIdeas).map((idea) => (
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
              ))}
            </div>
          </section>

          {/* Sentiment Analysis Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Sentiment Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card card-3d-effect lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5 text-primary" />
                    Social Media Engagement
                  </CardTitle>
                  <CardDescription>Last 7 days of engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={engagementData}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="engagement" fill="#8884d8" name="Engagement" />
                        <Bar dataKey="reach" fill="#82ca9d" name="Reach" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
                  <div className="h-60 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({name, value}) => `${name}: ${value}%`}
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 text-center mt-4">
                    <div>
                      <div className="text-2xl font-bold text-green-500">{sentimentData[0].value}%</div>
                      <div className="text-sm text-muted-foreground">Positive</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-500">{sentimentData[1].value}%</div>
                      <div className="text-sm text-muted-foreground">Neutral</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-500">{sentimentData[2].value}%</div>
                      <div className="text-sm text-muted-foreground">Negative</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Sponsor Suggestions */}
          <section>
            <h2 className="text-2xl font-bold mb-6">AI Sponsor Suggestions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(sponsorSuggestions && sponsorSuggestions.length > 0 ? sponsorSuggestions : defaultSponsors).map((sponsor, index) => (
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
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PRMarketing;
