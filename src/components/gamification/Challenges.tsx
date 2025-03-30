import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, MapPin, MessageSquare, Users, Share2, 
  Target, Clock, Calendar, CheckCircle, XCircle,
  AlertCircle, Trophy, QrCode, Send
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useGamification } from '../../context/GamificationContext';
import { useAuth } from '../../context/AuthContext';
import { format, formatDistance } from 'date-fns';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  eventId: string;
  type: 'quiz' | 'scavenger' | 'social' | 'networking' | 'sponsor' | 'feedback';
  points: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  questions?: {
    question: string;
    options: string[];
    correctAnswer: string;
    points: number;
  }[];
  locations?: {
    name: string;
    description: string;
    hint: string;
    code: string;
    points: number;
  }[];
}

interface ChallengesProps {
  challenges: Challenge[];
  eventId: string;
}

const ChallengesComponent: React.FC<ChallengesProps> = ({ challenges, eventId }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [locationCode, setLocationCode] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [locationResults, setLocationResults] = useState<any>(null);
  const { toast } = useToast();
  const { userProgress, startChallenge, submitQuizAnswers, checkInLocation } = useGamification();
  const { user } = useAuth();
  
  const getChallengeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'quiz':
        return <BookOpen className="h-5 w-5" />;
      case 'scavenger':
        return <MapPin className="h-5 w-5" />;
      case 'social':
        return <Share2 className="h-5 w-5" />;
      case 'networking':
        return <Users className="h-5 w-5" />;
      case 'sponsor':
        return <Target className="h-5 w-5" />;
      case 'feedback':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };
  
  const getChallengeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'quiz':
        return 'bg-purple-500/10 text-purple-500';
      case 'scavenger':
        return 'bg-green-500/10 text-green-500';
      case 'social':
        return 'bg-pink-500/10 text-pink-500';
      case 'networking':
        return 'bg-blue-500/10 text-blue-500';
      case 'sponsor':
        return 'bg-amber-500/10 text-amber-500';
      case 'feedback':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };
  
  const handleOpenChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setQuizAnswers(Array(challenge.questions?.length || 0).fill(''));
    setLocationCode('');
    setQuizSubmitted(false);
    setQuizResults(null);
    setLocationResults(null);
  };
  
  const handleStartChallenge = async () => {
    if (!selectedChallenge || !user) return;
    
    try {
      await startChallenge(selectedChallenge._id);
      
      toast({
        title: "Challenge Started",
        description: "You've started this challenge. Good luck!",
      });
    } catch (err) {
      console.error('Error starting challenge:', err);
      toast({
        title: "Error",
        description: "Failed to start the challenge. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleQuizAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answer;
    setQuizAnswers(newAnswers);
  };
  
  const handleSubmitQuiz = async () => {
    if (!selectedChallenge || !user) return;
    
    // Check if all questions are answered
    const unansweredQuestions = quizAnswers.findIndex(a => a === '');
    if (unansweredQuestions !== -1) {
      toast({
        title: "Incomplete Quiz",
        description: `Please answer question ${unansweredQuestions + 1} before submitting.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      const results = await submitQuizAnswers(selectedChallenge._id, quizAnswers);
      setQuizSubmitted(true);
      setQuizResults(results);
      
      toast({
        title: "Quiz Submitted",
        description: `You got ${results.correctAnswers} out of ${results.totalQuestions} correct and earned ${results.pointsEarned} points!`,
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast({
        title: "Error",
        description: "Failed to submit quiz answers. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCheckInLocation = async () => {
    if (!selectedChallenge || !user || !locationCode.trim()) return;
    
    try {
      const results = await checkInLocation(selectedChallenge._id, locationCode.trim());
      setLocationResults(results);
      setLocationCode('');
      
      toast({
        title: "Location Found!",
        description: results.message,
      });
    } catch (err: any) {
      console.error('Error checking in at location:', err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to check in at this location. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getChallengeStatus = (challengeId: string) => {
    const progress = userProgress[challengeId];
    if (!progress) return 'not_started';
    return progress.status;
  };
  
  const getChallengeProgress = (challengeId: string) => {
    const progress = userProgress[challengeId];
    if (!progress) return 0;
    return progress.progress;
  };
  
  const getPointsEarned = (challengeId: string) => {
    const progress = userProgress[challengeId];
    if (!progress) return 0;
    return progress.pointsEarned;
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No challenges available for this event yet.
          </div>
        ) : (
          challenges.map((challenge) => {
            const status = getChallengeStatus(challenge._id);
            const progress = getChallengeProgress(challenge._id);
            const pointsEarned = getPointsEarned(challenge._id);
            
            return (
              <Card 
                key={challenge._id} 
                className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
                onClick={() => handleOpenChallenge(challenge)}
              >
                <div className={`h-2 ${getChallengeColor(challenge.type).split(' ')[0]}`} />
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${getChallengeColor(challenge.type)}`}>
                        {getChallengeIcon(challenge.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">+{challenge.points} pts</Badge>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>
                        {status === 'completed' ? 'Completed' : 
                         status === 'in_progress' ? 'In Progress' : 
                         'Not Started'}
                      </span>
                      <span>
                        {pointsEarned}/{challenge.points} pts
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <Badge variant="outline" className={getChallengeColor(challenge.type)}>
                      <span className="flex items-center gap-1">
                        {getChallengeIcon(challenge.type)}
                        {challenge.type}
                      </span>
                    </Badge>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistance(new Date(challenge.endDate), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Challenge Detail Dialog */}
      <Dialog open={!!selectedChallenge} onOpenChange={(open) => !open && setSelectedChallenge(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedChallenge && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`p-1 rounded ${getChallengeColor(selectedChallenge.type)}`}>
                    {getChallengeIcon(selectedChallenge.type)}
                  </div>
                  {selectedChallenge.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedChallenge.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Ends {format(new Date(selectedChallenge.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Badge variant="outline">
                    +{selectedChallenge.points} points
                  </Badge>
                </div>
                
                {/* Challenge Status */}
                {user && (
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between text-xs mb-1">
                      <span>
                        {getChallengeStatus(selectedChallenge._id) === 'completed' ? 'Completed' : 
                         getChallengeStatus(selectedChallenge._id) === 'in_progress' ? 'In Progress' : 
                         'Not Started'}
                      </span>
                      <span>
                        {getPointsEarned(selectedChallenge._id)}/{selectedChallenge.points} pts
                      </span>
                    </div>
                    <Progress 
                      value={getChallengeProgress(selectedChallenge._id)} 
                      className="h-2" 
                    />
                  </div>
                )}
                
                {/* Challenge Content Based on Type */}
                {selectedChallenge.type === 'quiz' && selectedChallenge.questions && (
                  <div className="space-y-6">
                    {!quizSubmitted ? (
                      <>
                        <div className="space-y-4">
                          {selectedChallenge.questions.map((question, qIndex) => (
                            <div key={qIndex} className="space-y-2">
                              <h4 className="font-medium">
                                {qIndex + 1}. {question.question}
                              </h4>
                              <RadioGroup 
                                value={quizAnswers[qIndex]} 
                                onValueChange={(value) => handleQuizAnswerChange(qIndex, value)}
                              >
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`q${qIndex}-o${oIndex}`} />
                                    <Label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          ))}
                        </div>
                        
                        <DialogFooter>
                          {getChallengeStatus(selectedChallenge._id) === 'not_started' ? (
                            <Button onClick={handleStartChallenge}>Start Quiz</Button>
                          ) : (
                            <Button onClick={handleSubmitQuiz}>Submit Answers</Button>
                          )}
                        </DialogFooter>
                      </>
                    ) : quizResults && (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                          <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <h3 className="font-semibold text-lg">Quiz Completed!</h3>
                          <p className="text-muted-foreground">
                            You got {quizResults.correctAnswers} out of {quizResults.totalQuestions} correct
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-green-100">
                              +{quizResults.pointsEarned} points earned
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedChallenge.type === 'scavenger' && (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-medium mb-2">How to play:</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Find QR codes or location markers around the event</li>
                        <li>Scan the QR code or enter the location code below</li>
                        <li>Earn points for each location you discover</li>
                        <li>Find all locations to complete the challenge</li>
                      </ol>
                    </div>
                    
                    {selectedChallenge.locations && (
                      <div className="space-y-3">
                        <h3 className="font-medium">Locations to find:</h3>
                        {selectedChallenge.locations.map((location, index) => {
                          const found = userProgress[selectedChallenge._id]?.locationsFound?.some(
                            (loc: any) => loc.locationIndex === index
                          );
                          
                          return (
                            <div 
                              key={index} 
                              className={`p-3 rounded-md border ${
                                found ? 'bg-green-50 border-green-200' : 'bg-muted border-transparent'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  {found ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                  )}
                                  <span className={found ? 'font-medium' : ''}>
                                    {location.name}
                                  </span>
                                </div>
                                <Badge variant="outline">
                                  +{location.points} pts
                                </Badge>
                              </div>
                              
                              {found ? (
                                <p className="text-xs text-muted-foreground mt-1 ml-7">
                                  Found!
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-1 ml-7">
                                  Hint: {location.hint}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {locationResults && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700">
                          {locationResults.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter location code" 
                        value={locationCode}
                        onChange={(e) => setLocationCode(e.target.value)}
                      />
                      <Button 
                        onClick={handleCheckInLocation}
                        disabled={!locationCode.trim()}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Check In
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Other challenge types would go here */}
                {(selectedChallenge.type === 'networking' || 
                  selectedChallenge.type === 'social' || 
                  selectedChallenge.type === 'sponsor' || 
                  selectedChallenge.type === 'feedback') && (
                  <div className="text-center py-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      This challenge type will be available soon.
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

export default ChallengesComponent;
