import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Award, Star, Users, MessageSquare, Calendar, 
  Share2, Target, Check, Lock, Info
} from 'lucide-react';
import { format } from 'date-fns';

interface Achievement {
  _id: string;
  name: string;
  description: string;
  image?: string;
  points: number;
  category: 'networking' | 'attendance' | 'engagement' | 'feedback' | 'social';
}

interface UserAchievement {
  achievementId: Achievement;
  dateEarned: string;
}

interface AchievementsProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
}

const AchievementsComponent: React.FC<AchievementsProps> = ({ achievements, userAchievements }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'networking':
        return <Users className="h-4 w-4" />;
      case 'attendance':
        return <Calendar className="h-4 w-4" />;
      case 'engagement':
        return <Target className="h-4 w-4" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4" />;
      case 'social':
        return <Share2 className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };
  
  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'networking':
        return 'bg-blue-500/10 text-blue-500';
      case 'attendance':
        return 'bg-green-500/10 text-green-500';
      case 'engagement':
        return 'bg-purple-500/10 text-purple-500';
      case 'feedback':
        return 'bg-orange-500/10 text-orange-500';
      case 'social':
        return 'bg-pink-500/10 text-pink-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };
  
  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievementId._id === achievementId);
  };
  
  const getEarnedDate = (achievementId: string) => {
    const userAchievement = userAchievements.find(ua => ua.achievementId._id === achievementId);
    return userAchievement ? new Date(userAchievement.dateEarned) : null;
  };
  
  // Filter achievements by category
  const filterAchievementsByCategory = (category: Achievement['category'] | 'all') => {
    if (category === 'all') return achievements;
    return achievements.filter(a => a.category === category);
  };
  
  return (
    <div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="networking">Networking</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>
        
        {['all', 'networking', 'attendance', 'engagement', 'feedback', 'social'].map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterAchievementsByCategory(category as Achievement['category'] | 'all').map((achievement) => {
                const earned = isAchievementEarned(achievement._id);
                const earnedDate = getEarnedDate(achievement._id);
                
                return (
                  <Card 
                    key={achievement._id} 
                    className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${
                      earned ? 'border-2 border-primary/20' : 'opacity-80'
                    }`}
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    <div className={`h-2 ${getCategoryColor(achievement.category).split(' ')[0]}`} />
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-full ${getCategoryColor(achievement.category)}`}>
                            {earned ? (
                              <Award className="h-6 w-6" />
                            ) : (
                              <Lock className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{achievement.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">+{achievement.points} pts</Badge>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(achievement.category)}
                            {achievement.category}
                          </span>
                        </Badge>
                        
                        {earned && earnedDate && (
                          <span className="text-xs text-muted-foreground">
                            Earned {format(earnedDate, 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {filterAchievementsByCategory(category as Achievement['category'] | 'all').length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No achievements found in this category.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Achievement Detail Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAchievement.name}</DialogTitle>
                <DialogDescription>
                  {getCategoryIcon(selectedAchievement.category)}
                  <span className="ml-1 capitalize">{selectedAchievement.category}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`p-6 rounded-full ${getCategoryColor(selectedAchievement.category)}`}>
                    {isAchievementEarned(selectedAchievement._id) ? (
                      <Award className="h-12 w-12" />
                    ) : (
                      <Lock className="h-12 w-12" />
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAchievement.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Reward</h4>
                  <p className="text-sm text-muted-foreground">
                    +{selectedAchievement.points} points
                  </p>
                </div>
                
                {isAchievementEarned(selectedAchievement._id) && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Earned</h4>
                    <p className="text-sm text-muted-foreground">
                      {getEarnedDate(selectedAchievement._id) ? 
                        format(getEarnedDate(selectedAchievement._id) as Date, 'MMMM d, yyyy') : 
                        'Unknown date'}
                    </p>
                  </div>
                )}
                
                {!isAchievementEarned(selectedAchievement._id) && (
                  <div className="bg-muted p-3 rounded-md flex items-start gap-2">
                    <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Continue participating in the event to unlock this achievement.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementsComponent;
