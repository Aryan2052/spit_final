import React, { useState, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventManagementForm from '../components/EventManagementForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  Zap, 
  Clock, 
  Users, 
  FileText, 
  AlertTriangle,
  Calendar,
  MapPin,
  Mail, 
  Send
} from 'lucide-react';
import { toast, Toaster } from "react-hot-toast"; 
import { Button } from "@/components/ui/button";

type FormData = {
  eventName: string;
  eventTheme: string;
  budget: string;
  location: string;
  prTasks: string;
  techTasks: string;
  logisticsTasks: string;
  creativesTasks: string;
  speakerRecommendations: boolean;
  judgeRecommendations: boolean;
};

type PastEventData = {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  image: string;
  organizer: string;
  category?: string;
};

type AIGeneratedTask = {
  description: string;
  complexity: 'Low' | 'Medium' | 'High';
  estimatedTime: string;
  assignedTo?: string;
};

type TeamEmail = {
  team: string;
  email: string;
};

const EventManagement = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [pastEvents, setPastEvents] = useState<PastEventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PastEventData | undefined>();
  const [aiGeneratedTasks, setAIGeneratedTasks] = useState<{
    pr?: AIGeneratedTask[];
    tech?: AIGeneratedTask[];
    logistics?: AIGeneratedTask[];
    creatives?: AIGeneratedTask[];
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("pr");
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset } = useForm<PastEventData>();

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

  const teamEmails: TeamEmail[] = [
    { team: 'pr', email: 'pr-team@example.com' },
    { team: 'tech', email: 'atharvaprabhu691@gmail.com' },
    { team: 'logistics', email: 'logistics-team@example.com' },
    { team: 'creatives', email: 'creatives-team@example.com' },
  ];

  const formatEmailContent = (teamType: string, tasks: AIGeneratedTask[]) => {
    const date = new Date().toLocaleDateString();
    const subject = `[${formData?.eventName || 'Event'}] Tasks for ${teamType.toUpperCase()} Team - ${date}`;
    
    let body = `
Dear ${teamType.charAt(0).toUpperCase() + teamType.slice(1)} Team,

I hope this email finds you well. Below are the tasks assigned to your team for the upcoming event "${formData?.eventName || 'Event'}".

TASKS:
${tasks.map((task, index) => `
${index + 1}. ${task.description}
   Priority: ${task.complexity}
   Estimated Time: ${task.estimatedTime}
   Assigned To: ${task.assignedTo || teamType + ' Team'}
`).join('')}

Please review these tasks and let me know if you have any questions or concerns. Your timely completion of these tasks is crucial for the success of our event.

Best regards,
Event Management Team
`;

    return { subject, body };
  };

  const sendTeamEmail = async (teamType: string) => {
    try {
      setIsLoading(true);
      const tasks = aiGeneratedTasks[teamType as keyof typeof aiGeneratedTasks] || [];
      
      if (tasks.length === 0) {
        toast.error(`No tasks available for ${teamType} team`);
        return;
      }
      
      const teamEmail = teamEmails.find(t => t.team === teamType)?.email;
      if (!teamEmail) {
        toast.error(`Email address not found for ${teamType} team`);
        return;
      }
      
      const { subject, body } = formatEmailContent(teamType, tasks);
      
      // In a real application, you would send this via your backend API
      // For now, we'll simulate sending and show a success message
      
      // Example of how you would call your backend API:
      /*
      const response = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          to: teamEmail,
          subject,
          body,
          teamType
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      */
      
      // For demonstration, we'll just log the email content and show a success message
      console.log('Email Content:', { to: teamEmail, subject, body });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Email sent to ${teamType} team at ${teamEmail}`);
    } catch (error) {
      console.error(`Error sending email to ${teamType} team:`, error);
      toast.error(`Failed to send email to ${teamType} team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendAllTeamEmails = async () => {
    const teamTypes = ['pr', 'tech', 'logistics', 'creatives'];
    for (const team of teamTypes) {
      await sendTeamEmail(team);
    }
  };

  const fetchPastEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/events");
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setPastEvents(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching past events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const onSubmitPastEvent = async (data: PastEventData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to add events");
        return;
      }

      const formData = {
        ...data,
        timeline: new Date(data.date).toISOString() // Convert date to ISO string
      };

      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add event');
      }
      
      reset();
      fetchPastEvents();
      setError(null);
    } catch (error) {
      console.error('Error adding past event:', error);
      setError(error instanceof Error ? error.message : 'Failed to add event');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = pastEvents.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const extractTasksManually = (response: string): AIGeneratedTask[] => {
    const taskDescriptions = response.split('\n')
      .filter(line => 
        line.trim().length > 0 && 
        !line.includes('```') && 
        !line.toLowerCase().includes('json')
      )
      .slice(0, 5); // Limit to 5 tasks

    return taskDescriptions.map(desc => ({
      description: desc.replace(/^[-*]?\s*/, '').trim(),
      complexity: 'Medium',
      estimatedTime: '1-2 hours',
      assignedTo: 'Team'
    }));
  };

  const generateAITasks = async (teamType: string, existingTasks: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!genAI) {
        throw new Error('Gemini API Key is missing');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are an expert event management AI assistant. Generate a comprehensive list of tasks for the ${teamType} team for an event named "${formData?.eventName}".

Existing tasks: ${existingTasks}

For each task, provide a detailed JSON object with the following structure:
{
  "description": "Specific, actionable task description",
  "complexity": "Low" | "Medium" | "High",
  "estimatedTime": "Time required to complete the task (e.g., '2 hours', '1 day')",
  "assignedTo": "Optional suggested team role or department"
}

Generate 3-5 additional tasks that complement the existing tasks and ensure event success. Focus on practicality, efficiency, and thorough event preparation.`;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      // Extract JSON from code block or parse directly
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```|(\[.*\])/);
      let generatedTasks: AIGeneratedTask[] = [];

      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[2];
        try {
          generatedTasks = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('JSON Parsing Error:', parseError);
          // Fallback parsing
          generatedTasks = extractTasksManually(response);
        }
      } else {
        // Fallback parsing if no JSON found
        generatedTasks = extractTasksManually(response);
      }

      // Validate and clean tasks
      const validatedTasks = generatedTasks.map(task => ({
        description: task.description || 'Unspecified task',
        complexity: task.complexity || 'Medium',
        estimatedTime: task.estimatedTime || '1-2 hours',
        assignedTo: task.assignedTo || `${teamType.charAt(0).toUpperCase() + teamType.slice(1)} Team`
      })).filter(task => task.description);

      setAIGeneratedTasks((prev) => ({
        ...prev,
        [teamType]: validatedTasks,
      }));

    } catch (error) {
      console.error(`Error generating tasks for ${teamType}:`, error);
      setError(`Failed to generate tasks for ${teamType}. ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSelect = (eventId: string) => {
    const event = pastEvents.find(e => e._id === eventId);
    setSelectedEvent(event);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setFormData(data);

    // Automatically generate AI tasks for each team
    generateAITasks('pr', data.prTasks);
    generateAITasks('tech', data.techTasks);
    generateAITasks('logistics', data.logisticsTasks);
    generateAITasks('creatives', data.creativesTasks);
  };

  const renderTeamTasks = (teamType: keyof typeof aiGeneratedTasks) => {
    const tasks = aiGeneratedTasks[teamType] || [];

    return (
      <div className="space-y-4">
        {tasks.length > 0 && (
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => sendTeamEmail(teamType)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Mail size={16} />
              Email Tasks to {teamType.toUpperCase()} Team
            </Button>
          </div>
        )}
        {tasks.map((task, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 text-primary" size={20} />
                {task.complexity} Priority Task
              </CardTitle>
              <CardDescription>
                <Clock className="inline-block mr-2" size={16} />
                Estimated Time: {task.estimatedTime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{task.description}</p>
              {task.assignedTo && (
                <div className="mt-2 flex items-center">
                  <Users className="mr-2" size={16} />
                  <span>Assigned to: {task.assignedTo}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!GEMINI_API_KEY) {
    return (
      <div className="container mx-auto p-6 text-center text-red-500">
        <h1>Configuration Error</h1>
        <p>Gemini API Key is missing. Please check your .env file.</p>
        <p>Ensure you have VITE_GEMINI_API_KEY set correctly.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-24">
        <Tabs defaultValue="planning" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="planning">Event Planning</TabsTrigger>
            <TabsTrigger value="add">Add Events</TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <Card>
              <CardHeader>
                <CardTitle>Event Planning Assistant</CardTitle>
                <CardDescription>
                  Plan your event and get AI-generated task suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EventManagementForm 
                  onSubmit={onSubmit}
                  isLoading={isLoading}
                  pastEvents={pastEvents}
                  onEventSelect={handleEventSelect}
                  selectedEvent={selectedEvent}
                />
                {/* Tasks Display Section */}
                {Object.keys(aiGeneratedTasks).length > 0 && (
                  <div className="max-w-4xl mx-auto mt-12">
                    <div className="flex justify-end mb-4">
                      <Button 
                        onClick={sendAllTeamEmails}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <Send size={16} />
                        Send Tasks to All Teams
                      </Button>
                    </div>
                    <Tabs 
                      value={selectedTab} 
                      onValueChange={setSelectedTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="pr">
                          <FileText className="mr-2" /> PR
                        </TabsTrigger>
                        <TabsTrigger value="tech">
                          <Zap className="mr-2" /> Tech
                        </TabsTrigger>
                        <TabsTrigger value="logistics">
                          <Users className="mr-2" /> Logistics
                        </TabsTrigger>
                        <TabsTrigger value="creatives">
                          <Clock className="mr-2" /> Creatives
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="pr">
                        {renderTeamTasks('pr')}
                      </TabsContent>
                      <TabsContent value="tech">
                        {renderTeamTasks('tech')}
                      </TabsContent>
                      <TabsContent value="logistics">
                        {renderTeamTasks('logistics')}
                      </TabsContent>
                      <TabsContent value="creatives">
                        {renderTeamTasks('creatives')}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add Events</CardTitle>
                <CardDescription>
                  Add and view past events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmitPastEvent)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Event Name *</label>
                    <input
                      {...register("name", { required: "Event name is required" })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Enter event name"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea
                      {...register("description", { required: "Description is required" })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Enter event description"
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date *</label>
                      <input
                        type="datetime-local"
                        {...register("date", { required: "Date is required" })}
                        className="w-full p-2 border rounded-lg"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Location *</label>
                      <input
                        {...register("location", { required: "Location is required" })}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Enter event location"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL *</label>
                    <input
                      {...register("image", { 
                        required: "Image URL is required",
                        pattern: {
                          value: /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/,
                          message: "Please enter a valid image URL"
                        }
                      })}
                      type="url"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Please provide a direct link to an image (ending in .jpg, .png, etc.)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Organizer *</label>
                    <input
                      {...register("organizer", { required: "Organizer name is required" })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Enter organizer name"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      {...register("category", { required: "Category is required" })}
                      className="w-full p-2 border rounded-lg"
                      disabled={isLoading}
                    >
                      <option value="">Select a category</option>
                      <option value="sports">Sports</option>
                      <option value="tech">Tech</option>
                      <option value="cultural">Cultural</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding Event..." : "Add Event"}
                  </button>
                </form>

                <div className="mt-8">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                      <div className="col-span-full text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading events...</p>
                      </div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        {searchTerm ? "No events found matching your search." : "No events added yet."}
                      </div>
                    ) : (
                      filteredEvents.map((event, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                          {event.image && (
                            <div className="aspect-video w-full overflow-hidden">
                              <img 
                                src={event.image} 
                                alt={event.name}
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{event.category}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default EventManagement;