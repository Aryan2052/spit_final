import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, MapPin, Clock, Users, ChevronLeft, Share2, Check, Search, X, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

interface Event {
  _id: string;
  name: string;
  description: string;
  timeline?: string;
  date?: string;
  location: string;
  image?: string;
  imageUrl?: string;
  organizer?: string;
  category?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface RegistrationFormData {
  name: string;
  email: string;
  teamSize: string;
  teamMembers: string;
}

const EventInfo = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abstract, setAbstract] = useState<string>('');
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: 'Team size',
      answer: '1 - 6 members'
    },
    {
      question: 'Registration costs?',
      answer: 'Nada.'
    },
    {
      question: 'What can I expect to learn?',
      answer: 'You\'ll gain hands-on experience and knowledge in the subject area, network with peers, and potentially develop new skills relevant to your field.'
    },
    {
      question: 'How should I prepare for this event?',
      answer: 'Come with an open mind and be ready to collaborate. Bringing your laptop and any relevant tools would be beneficial. Prior knowledge of the subject matter is helpful but not required.'
    }
  ]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState<RegistrationFormData>({
    name: '',
    email: '',
    teamSize: '1',
    teamMembers: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [faqQuery, setFaqQuery] = useState('');
  const [searchingFaq, setSearchingFaq] = useState(false);
  const [faqSearchResult, setFaqSearchResult] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  
  // Check if event date is in the past
  const isEventPast = (eventDate?: string) => {
    if (!eventDate) return false;
    const today = new Date();
    const eventDateTime = new Date(eventDate);
    return eventDateTime < today;
  };
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);
        
        // Generate abstract for the event
        generateEventAbstract(response.data);
        
        // Check if user is already registered for this event
        checkRegistrationStatus(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);
  
  const generateEventAbstract = async (eventData: Event) => {
    try {
      // Create a standard abstract if event name/description is not meaningful enough
      const standardAbstract = `
        This exciting event brings together professionals and enthusiasts to explore cutting-edge concepts and techniques in ${eventData.name}. 
        Participants will have the opportunity to network, learn from experts, and engage in hands-on activities. 
        The event is designed to foster collaboration and innovation, providing a platform for attendees to share ideas and develop new skills. 
        Whether you're a beginner or an experienced practitioner, this event offers valuable insights and practical knowledge that you can apply in your field. 
        Join us for an enriching experience that combines learning, networking, and fun in a supportive environment.
        
        During this event, you'll participate in interactive sessions, workshops, and discussions led by industry leaders. 
        You'll gain insights into the latest trends, technologies, and methodologies relevant to ${eventData.name}. 
        The collaborative atmosphere encourages the exchange of ideas and the formation of new connections with like-minded individuals. 
        By the end of the event, you'll have expanded your knowledge base, enhanced your skills, and potentially discovered new opportunities for personal and professional growth.
        
        Don't miss this chance to be part of a dynamic community dedicated to advancing the field and making meaningful contributions.
      `;
      
      setAbstract(standardAbstract.replace(/\n\s+/g, ' ').trim());
    } catch (error) {
      console.error('Error generating abstract:', error);
      // Use fallback content
      setAbstract(`
        This exciting event brings together professionals and enthusiasts to explore cutting-edge concepts and techniques. 
        Participants will have the opportunity to network, learn from experts, and engage in hands-on activities. 
        The event is designed to foster collaboration and innovation, providing a platform for attendees to share ideas and develop new skills. 
        Whether you're a beginner or an experienced practitioner, this event offers valuable insights and practical knowledge that you can apply in your field. 
        Join us for an enriching experience that combines learning, networking, and fun in a supportive environment.
      `.replace(/\n\s+/g, ' ').trim());
    }
  };
  
  const checkRegistrationStatus = (eventData: Event) => {
    if (!user) return;
    
    // Get registered events from localStorage
    const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents') || '[]');
    const isAlreadyRegistered = registeredEvents.some((event: any) => event._id === id);
    setIsRegistered(isAlreadyRegistered);
  };
  
  const handleRegistrationOpen = () => {
    if (event && isEventPast(event.timeline || event.date)) {
      toast({
        title: "Registration Closed",
        description: "Registration for this event has ended as the event date has passed.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for this event.",
        variant: "destructive"
      });
      return;
    }
    
    setIsRegistrationOpen(true);
    
    // Pre-fill form with user data if available
    if (user) {
      setRegistrationForm(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || ''
      }));
    }
  };
  
  const handleRegistrationClose = () => {
    setIsRegistrationOpen(false);
  };
  
  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for this event.",
        variant: "destructive"
      });
      return;
    }
    
    if (!event) return;
    
    try {
      setIsRegistering(true);
      
      // Save registration to localStorage
      const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents') || '[]');
      
      // Check if already registered
      if (registeredEvents.some((e: any) => e._id === event._id)) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event.",
          variant: "default"
        });
        setIsRegistering(false);
        setIsRegistrationOpen(false);
        return;
      }
      
      // Add event to registered events
      registeredEvents.push({
        _id: event._id,
        name: event.name,
        date: event.date || event.timeline,
        location: event.location
      });
      
      localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
      
      setIsRegistered(true);
      setIsRegistrationOpen(false);
      
      // Trigger a custom event to notify the navbar
      window.dispatchEvent(new CustomEvent('eventRegistered', { detail: event }));
      
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for this event.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error registering for event:', error);
      
      toast({
        title: "Registration Failed",
        description: "Failed to register for the event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleFaqSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!faqQuery.trim()) return;
    
    try {
      setSearchingFaq(true);
      setFaqSearchResult(null);
      
      // Generate a response for the FAQ query
      const response = `Based on the event "${event?.name}", here's an answer to your question about "${faqQuery}":
      
      ${event?.name} is designed to provide participants with a comprehensive understanding of the subject matter. Your question about "${faqQuery}" is relevant to many attendees.
      
      For this specific query, we recommend preparing by reviewing basic concepts related to the topic, bringing any necessary equipment mentioned in the event description, and coming with an open mind ready to collaborate with other participants.
      
      The event organizers have structured the program to address various aspects of ${event?.name}, including topics related to your question. During the event, there will be opportunities to ask more specific questions to the presenters and engage with experts in the field.
      
      We hope this helps, and we look forward to seeing you at the event!`;
      
      setFaqSearchResult(response);
    } catch (error) {
      console.error('Error searching FAQ:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search for an answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSearchingFaq(false);
    }
  };
  
  const clearFaqSearch = () => {
    setFaqQuery('');
    setFaqSearchResult(null);
  };
  
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
  
  if (error || !event) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
              <p className="mb-6">{error || 'Event not found'}</p>
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
            <Link to="/">
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>
          
          {/* Event Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Event Image */}
              <div className="w-full md:w-1/2">
                {event.imageUrl || event.image ? (
                  <img 
                    src={event.imageUrl || event.image} 
                    alt={event.name} 
                    className="w-full h-[300px] object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-event.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg flex items-center justify-center">
                    <Calendar className="h-20 w-20 text-primary" />
                  </div>
                )}
              </div>
              
              {/* Event Details */}
              <div className="w-full md:w-1/2">
                <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
                <p className="text-muted-foreground mb-4">{event.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <span>{event.timeline || event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-2" />
                    <span>Team Size: 1-6 members</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.category && (
                    <Badge className="bg-blue-500/10 text-blue-500">
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </Badge>
                  )}
                  {isEventPast(event.timeline || event.date) ? (
                    <Badge className="bg-gray-500/10 text-gray-500">Registration Closed</Badge>
                  ) : (
                    <Badge className="bg-green-500/10 text-green-500">Registration Open</Badge>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  {isRegistered ? (
                    <Button variant="outline" disabled className="bg-green-50">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Registered
                    </Button>
                  ) : isEventPast(event.timeline || event.date) ? (
                    <Button variant="outline" disabled className="bg-gray-50">
                      <X className="h-4 w-4 mr-2 text-gray-500" />
                      Closed Registration
                    </Button>
                  ) : (
                    <Button onClick={handleRegistrationOpen}>Register Now</Button>
                  )}
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {isRegistered && (
                    <Link to={`/event/${event._id}/gamification`}>
                      <Button variant="default">
                        <Trophy className="h-4 w-4 mr-2" />
                        Gamification
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Event Abstract */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{abstract || event.description}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* FAQs */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>
                Frequently asked questions about this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* FAQ Search */}
              <div className="mb-6">
                <form onSubmit={handleFaqSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Ask a question about this event..."
                      value={faqQuery}
                      onChange={(e) => setFaqQuery(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button type="submit" disabled={searchingFaq || !faqQuery.trim()}>
                    {searchingFaq ? "Searching..." : "Search"}
                  </Button>
                </form>
                
                {faqSearchResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Answer to your question</h4>
                      <Button variant="ghost" size="sm" onClick={clearFaqSearch}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-line">{faqSearchResult}</p>
                  </div>
                )}
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      
      {/* Registration Dialog */}
      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Register for {event.name}</DialogTitle>
            <DialogDescription>
              Fill out the form below to register for this event.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegistrationSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={registrationForm.name}
                  onChange={handleRegistrationChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={registrationForm.email}
                  onChange={handleRegistrationChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teamSize" className="text-right">
                  Team Size
                </Label>
                <Input
                  id="teamSize"
                  name="teamSize"
                  type="number"
                  min="1"
                  max="6"
                  value={registrationForm.teamSize}
                  onChange={handleRegistrationChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teamMembers" className="text-right">
                  Team Members
                </Label>
                <Input
                  id="teamMembers"
                  name="teamMembers"
                  placeholder="Enter team member names (comma separated)"
                  value={registrationForm.teamMembers}
                  onChange={handleRegistrationChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleRegistrationClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isRegistering}>
                {isRegistering ? "Registering..." : "Register"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventInfo;
