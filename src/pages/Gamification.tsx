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
  Camera, MessageSquare, Share2, Target, Zap
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
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
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gamification;
