import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, Medal, Award, Star, Calendar, Clock, MapPin, 
  Check, ChevronRight, ChevronLeft, Users, BookOpen, 
  Camera, MessageSquare, Share2, Target, Zap, BarChart2
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  Tooltip, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";
import LeaderboardComponent from '../components/gamification/Leaderboard';
import AchievementsComponent from '../components/gamification/Achievements';
import ChallengesComponent from '../components/gamification/Challenges';

const Gamification = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    userPoints, 
    leaderboard, 
    achievements, 
    challenges,
    loadUserPoints, 
    loadLeaderboard, 
    loadAchievements, 
    loadChallenges,
    error
  } = useGamification();

  // Static stats data for gamification visualizations
  const [gamificationStats, setGamificationStats] = useState({
    participationData: [
      { name: "Registered", value: 85 },
      { name: "Participated", value: 65 },
      { name: "Completed", value: 45 },
    ],
    pointsDistribution: [
      { name: "0-100", count: 25 },
      { name: "101-200", count: 18 },
      { name: "201-300", count: 12 },
      { name: "301-400", count: 8 },
      { name: "401+", count: 5 },
    ],
    engagementMetrics: [
      { name: "Day 1", points: 120, participants: 65 },
      { name: "Day 2", points: 180, participants: 55 },
      { name: "Day 3", points: 250, participants: 48 },
      { name: "Day 4", points: 200, participants: 42 },
      { name: "Day 5", points: 320, participants: 40 },
    ],
    achievementCompletion: [
      { name: "Attendance", completed: 65, total: 85 },
      { name: "Participation", completed: 45, total: 85 },
      { name: "Feedback", completed: 38, total: 85 },
      { name: "Social Share", completed: 25, total: 85 },
      { name: "Challenge", completed: 20, total: 85 },
    ],
    skillRadarData: [
      { subject: "Teamwork", value: 80, fullMark: 100 },
      { subject: "Problem Solving", value: 75, fullMark: 100 },
      { subject: "Communication", value: 65, fullMark: 100 },
      { subject: "Creativity", value: 70, fullMark: 100 },
      { subject: "Technical", value: 85, fullMark: 100 },
      { subject: "Presentation", value: 60, fullMark: 100 },
    ],
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    const fetchEventAndGameData = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventResponse = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(eventResponse.data);
        
        // Load gamification data
        if (user) {
          await loadUserPoints(id as string);
        }
        
        await loadLeaderboard(id as string);
        await loadAchievements();
        await loadChallenges(id as string);
      } catch (err) {
        console.error('Error fetching event and gamification data:', err);
        toast({
          title: "Error",
          description: "Failed to load event and gamification data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchEventAndGameData();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
              <p className="mb-6">Event not found</p>
              <Link to="/">
                <Button>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <div className="mb-6">
            <Link to={`/event/${id}`}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Event
              </Button>
            </Link>
          </div>
          
          {/* Event Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {event.name} - Gamification
            </h1>
            <p className="text-muted-foreground">
              Compete, earn points, and unlock achievements at this event!
            </p>
          </div>
          
          {/* User Points Card (if logged in) */}
          {user && userPoints && (
            <Card className="mb-8 overflow-hidden border-2 border-primary/20">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Your Progress</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/20 text-primary font-bold px-3 py-1">
                          Level {userPoints.level}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {userPoints.points} Points
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{userPoints.achievements.length}</div>
                        <div className="text-xs text-muted-foreground">Achievements</div>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {leaderboard.findIndex(entry => 
                            entry.userId._id === user.id
                          ) + 1 || '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">Rank</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress to Level {userPoints.level + 1}</span>
                      <span>{userPoints.points % 100}/100</span>
                    </div>
                    <Progress value={userPoints.points % 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Gamification Tabs */}
          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart2 className="h-4 w-4 mr-2" />
                Stats
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="leaderboard">
              <LeaderboardComponent 
                leaderboard={leaderboard} 
                currentUserId={user?.id} 
              />
            </TabsContent>
            
            <TabsContent value="achievements">
              <AchievementsComponent 
                achievements={achievements}
                userAchievements={userPoints?.achievements || []}
              />
            </TabsContent>
            
            <TabsContent value="challenges">
              <ChallengesComponent 
                challenges={challenges}
                eventId={id as string}
              />
            </TabsContent>
            
            <TabsContent value="stats">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="glass-card card-3d-effect">
                  <CardContent className="p-6">
                    <h3 className="text-muted-foreground text-sm">Total Participants</h3>
                    <div className="text-3xl font-bold mt-1">85</div>
                  </CardContent>
                </Card>
                <Card className="glass-card card-3d-effect">
                  <CardContent className="p-6">
                    <h3 className="text-muted-foreground text-sm">Average Points</h3>
                    <div className="text-3xl font-bold mt-1">215</div>
                  </CardContent>
                </Card>
                <Card className="glass-card card-3d-effect">
                  <CardContent className="p-6">
                    <h3 className="text-muted-foreground text-sm">Achievements Unlocked</h3>
                    <div className="text-3xl font-bold mt-1">193</div>
                  </CardContent>
                </Card>
                <Card className="glass-card card-3d-effect">
                  <CardContent className="p-6">
                    <h3 className="text-muted-foreground text-sm">Completion Rate</h3>
                    <div className="text-3xl font-bold mt-1">53%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Participation & Points Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <Card className="glass-card card-3d-effect">
                  <CardHeader>
                    <CardTitle>Participation Status</CardTitle>
                    <CardDescription>Breakdown of participant engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={gamificationStats.participationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {gamificationStats.participationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Points Distribution Chart */}
                <Card className="glass-card card-3d-effect">
                  <CardHeader>
                    <CardTitle>Points Distribution</CardTitle>
                    <CardDescription>Distribution of points across participants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={gamificationStats.pointsDistribution}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Participants" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Metrics & Achievement Completion */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Engagement Metrics */}
                <Card className="glass-card card-3d-effect">
                  <CardHeader>
                    <CardTitle>Daily Engagement</CardTitle>
                    <CardDescription>Points earned and participants over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={gamificationStats.engagementMetrics}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="points" 
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="participants" 
                            stroke="#82ca9d" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievement Completion */}
                <Card className="glass-card card-3d-effect">
                  <CardHeader>
                    <CardTitle>Achievement Completion</CardTitle>
                    <CardDescription>Completion rate for different achievement types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={gamificationStats.achievementCompletion}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" stackId="a" fill="#8884d8" />
                          <Bar dataKey="total" name="Total" stackId="a" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skill Radar Chart */}
              <Card className="glass-card card-3d-effect mb-12">
                <CardHeader>
                  <CardTitle>Skill Development</CardTitle>
                  <CardDescription>Skills developed through gamification activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={gamificationStats.skillRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Average Skills"
                          dataKey="value"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gamification;
