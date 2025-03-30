import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Reply, Trash2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Define the API URL
const API_URL = 'http://localhost:5000/api';

interface Reply {
  _id?: string;
  content: string;
  user: string;
  username: string;
  avatar: string;
  createdAt: string;
}

interface Message {
  _id: string;
  content: string;
  user: string;
  username: string;
  avatar: string;
  replies: Reply[];
  createdAt: string;
}

const DiscussionForum = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get auth context
  const auth = useAuth();
  const currentUser = auth.user;
  
  // Mock data for fallback
  const mockMessages = [
    {
      _id: '1',
      content: 'Has anyone attended the workshop on AI Ethics? What were your thoughts?',
      user: '2',
      username: 'Alex Johnson',
      avatar: 'AJ',
      replies: [
        {
          _id: '101',
          content: 'It was really insightful! The speaker covered a lot of ground on bias in AI systems.',
          user: '3',
          username: 'Taylor Smith',
          avatar: 'TS',
          createdAt: '2025-03-29T14:30:00Z'
        }
      ],
      createdAt: '2025-03-29T12:00:00Z'
    },
    {
      _id: '2',
      content: 'I\'m looking for study partners for the upcoming data science hackathon. Anyone interested?',
      user: '4',
      username: 'Jordan Lee',
      avatar: 'JL',
      replies: [],
      createdAt: '2025-03-29T10:15:00Z'
    }
  ];

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      if (!refreshing) {
        setRefreshing(true);
      }
      
      try {
        const response = await axios.get(`${API_URL}/messages`);
        setMessages(response.data);
        setError(null);
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Only use mock data on initial load, not during refresh
        if (loading) {
          setMessages(mockMessages);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (loading) {
        setError('Failed to fetch messages');
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    fetchMessages();
    
    // Set up polling to refresh messages every 30 seconds
    const intervalId = setInterval(fetchMessages, 30000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmitMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      // Create message object with username included
      const messageData = {
        content: newMessage,
        user: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.username?.substring(0, 2).toUpperCase() || 'U'
      };
      
      // Add message optimistically to UI first for better UX
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        ...messageData,
        replies: [],
        createdAt: new Date().toISOString()
      };
      
      setMessages([optimisticMessage, ...messages]);
      setNewMessage('');
      
      // Then try to save to API
      try {
        const response = await axios.post(`${API_URL}/messages`, messageData);
        
        // Replace optimistic message with real one from server
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === optimisticMessage._id ? response.data : msg
          )
        );
        
        // Refresh messages to ensure consistency
        fetchMessages();
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Message is already in UI, so we don't need to do anything on error
      }
    } catch (err) {
      console.error('Error posting message:', err);
      setError('Failed to post message');
    }
  };

  const handleSubmitReply = async (messageId: string) => {
    if (!replyContent.trim() || !currentUser) return;

    try {
      // Create reply object with username included
      const replyData = {
        content: replyContent,
        user: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.username?.substring(0, 2).toUpperCase() || 'U'
      };
      
      // Add reply optimistically to UI first for better UX
      const updatedMessages = messages.map(message => {
        if (message._id === messageId) {
          return {
            ...message,
            replies: [
              ...message.replies,
              {
                _id: `temp-${Date.now()}`,
                ...replyData,
                createdAt: new Date().toISOString()
              }
            ]
          };
        }
        return message;
      });
      
      setMessages(updatedMessages);
      setReplyContent('');
      setReplyingTo(null);
      
      // Then try to save to API
      try {
        const response = await axios.post(`${API_URL}/messages/${messageId}/replies`, replyData);
        
        // Update the message with the server response
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === messageId ? response.data : msg
          )
        );
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Reply is already in UI, so we don't need to do anything on error
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Remove message from UI first for better UX
      setMessages(messages.filter(message => message._id !== messageId));
      
      // Then try to delete from API
      try {
        await axios.delete(`${API_URL}/messages/${messageId}`);
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Message is already removed from UI, so we don't need to do anything on error
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleRefresh = () => {
    fetchMessages();
  };

  if (loading) {
    return (
      <Card className="glass-card card-3d-effect border-0">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card card-3d-effect border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            <div>
              <CardTitle>Discussion Forum</CardTitle>
              <CardDescription>
                Connect with other attendees, ask questions, and share your thoughts
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{currentUser?.username?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium">Posting as: {currentUser?.username || 'User'}</div>
          </div>
          <Textarea
            placeholder="Start a new discussion..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleSubmitMessage} disabled={!newMessage.trim()}>
              Post <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No discussions yet. Be the first to start one!
            </div>
          ) : (
            messages.map((message) => (
              <div key={message._id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{message.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{message.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                      {message.user === currentUser?.id && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDeleteMessage(message._id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-2">{message.content}</p>
                    
                    <div className="mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => setReplyingTo(replyingTo === message._id ? null : message._id)}
                      >
                        <Reply className="h-3 w-3 mr-1" /> Reply
                      </Button>
                    </div>
                    
                    {replyingTo === message._id && (
                      <div className="mt-3">
                        <Input
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="text-sm"
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleSubmitReply(message._id)}
                            disabled={!replyContent.trim()}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {message.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-border space-y-4">
                        {message.replies.map((reply) => (
                          <div key={reply._id} className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{reply.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-baseline">
                                <p className="font-medium text-sm">{reply.username}</p>
                                <p className="text-xs text-muted-foreground ml-2">
                                  {formatDate(reply.createdAt)}
                                </p>
                              </div>
                              <p className="text-sm mt-1">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionForum;
