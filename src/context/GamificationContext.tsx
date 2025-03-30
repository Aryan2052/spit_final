import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

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

interface Activity {
  type: 'attendance' | 'feedback' | 'networking' | 'challenge' | 'social' | 'sponsor';
  description: string;
  points: number;
  timestamp: string;
}

interface UserPoints {
  _id?: string;
  userId: string;
  eventId: string;
  points: number;
  achievements: UserAchievement[];
  activities: Activity[];
  level: number;
}

interface LeaderboardEntry {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  points: number;
  level: number;
}

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

interface UserProgress {
  _id?: string;
  userId: string;
  challengeId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  pointsEarned: number;
  completedAt?: string;
}

interface GamificationContextType {
  userPoints: UserPoints | null;
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
  challenges: Challenge[];
  userProgress: Record<string, UserProgress>;
  loadUserPoints: (eventId: string) => Promise<void>;
  loadLeaderboard: (eventId: string) => Promise<void>;
  loadAchievements: () => Promise<void>;
  loadChallenges: (eventId: string) => Promise<void>;
  addPoints: (eventId: string, points: number, activityType: Activity['type'], description: string) => Promise<void>;
  startChallenge: (challengeId: string) => Promise<UserProgress>;
  submitQuizAnswers: (challengeId: string, answers: string[]) => Promise<any>;
  checkInLocation: (challengeId: string, locationCode: string) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const GamificationContext = createContext<GamificationContextType>({
  userPoints: null,
  leaderboard: [],
  achievements: [],
  challenges: [],
  userProgress: {},
  loadUserPoints: async () => {},
  loadLeaderboard: async () => {},
  loadAchievements: async () => {},
  loadChallenges: async () => {},
  addPoints: async () => {},
  startChallenge: async () => ({ 
    userId: '', 
    challengeId: '', 
    status: 'not_started', 
    progress: 0, 
    pointsEarned: 0 
  }),
  submitQuizAnswers: async () => ({}),
  checkInLocation: async () => ({}),
  loading: false,
  error: null
});

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadUserPoints = async (eventId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/api/gamification/points/${eventId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setUserPoints(response.data);
    } catch (err: any) {
      console.error('Error loading user points:', err);
      setError(err.response?.data?.error || 'Failed to load user points');
    } finally {
      setLoading(false);
    }
  };
  
  const loadLeaderboard = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/api/gamification/leaderboard/${eventId}`);
      
      setLeaderboard(response.data);
    } catch (err: any) {
      console.error('Error loading leaderboard:', err);
      setError(err.response?.data?.error || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };
  
  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/api/gamification/achievements');
      
      setAchievements(response.data);
    } catch (err: any) {
      console.error('Error loading achievements:', err);
      setError(err.response?.data?.error || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };
  
  const loadChallenges = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/api/challenges/event/${eventId}`);
      
      setChallenges(response.data);
      
      // Load user progress for each challenge
      if (user) {
        const progressPromises = response.data.map((challenge: Challenge) => 
          axios.get(`http://localhost:5000/api/challenges/${challenge._id}/progress`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          })
        );
        
        const progressResponses = await Promise.all(progressPromises);
        
        const progressMap: Record<string, UserProgress> = {};
        progressResponses.forEach((res, index) => {
          const challengeId = response.data[index]._id;
          progressMap[challengeId] = res.data;
        });
        
        setUserProgress(progressMap);
      }
    } catch (err: any) {
      console.error('Error loading challenges:', err);
      setError(err.response?.data?.error || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };
  
  const addPoints = async (eventId: string, points: number, activityType: Activity['type'], description: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5000/api/gamification/points', {
        eventId,
        points,
        activityType,
        description
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setUserPoints(response.data);
      
      // Refresh leaderboard
      loadLeaderboard(eventId);
    } catch (err: any) {
      console.error('Error adding points:', err);
      setError(err.response?.data?.error || 'Failed to add points');
    } finally {
      setLoading(false);
    }
  };
  
  const startChallenge = async (challengeId: string) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`http://localhost:5000/api/challenges/${challengeId}/start`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Update user progress for this challenge
      setUserProgress(prev => ({
        ...prev,
        [challengeId]: response.data
      }));
      
      return response.data;
    } catch (err: any) {
      console.error('Error starting challenge:', err);
      setError(err.response?.data?.error || 'Failed to start challenge');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const submitQuizAnswers = async (challengeId: string, answers: string[]) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`http://localhost:5000/api/challenges/${challengeId}/submit-quiz`, {
        answers
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Update user progress for this challenge
      setUserProgress(prev => ({
        ...prev,
        [challengeId]: response.data.progress
      }));
      
      // If challenge is in current event, refresh user points
      const challenge = challenges.find(c => c._id === challengeId);
      if (challenge && userPoints && challenge.eventId === userPoints.eventId) {
        loadUserPoints(challenge.eventId);
      }
      
      return response.data;
    } catch (err: any) {
      console.error('Error submitting quiz answers:', err);
      setError(err.response?.data?.error || 'Failed to submit quiz answers');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const checkInLocation = async (challengeId: string, locationCode: string) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`http://localhost:5000/api/challenges/${challengeId}/checkin`, {
        locationCode
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Update user progress for this challenge
      setUserProgress(prev => ({
        ...prev,
        [challengeId]: response.data.progress
      }));
      
      // If challenge is in current event, refresh user points
      const challenge = challenges.find(c => c._id === challengeId);
      if (challenge && userPoints && challenge.eventId === userPoints.eventId) {
        loadUserPoints(challenge.eventId);
      }
      
      return response.data;
    } catch (err: any) {
      console.error('Error checking in at location:', err);
      setError(err.response?.data?.error || 'Failed to check in at location');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <GamificationContext.Provider
      value={{
        userPoints,
        leaderboard,
        achievements,
        challenges,
        userProgress,
        loadUserPoints,
        loadLeaderboard,
        loadAchievements,
        loadChallenges,
        addPoints,
        startChallenge,
        submitQuizAnswers,
        checkInLocation,
        loading,
        error
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};
