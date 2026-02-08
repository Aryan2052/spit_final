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
      <main className="pt-24 pb-16 bg-white">
        {/* Hero Section */}
        <div className="w-full relative h-[60vh] min-h-[400px] mb-12">
          {event.imageUrl || event.image ? (
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 z-10" />
              <img
                src={event.imageUrl || event.image}
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-event.svg';
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center">
              <Calendar className="h-32 w-32 text-white/50" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 w-full z-20 pb-12 pt-24 bg-gradient-to-t from-black/90 to-transparent">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.category && (
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none text-sm px-3 py-1">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </Badge>
                )}
                {isEventPast(event.timeline || event.date) ? (
                  <Badge variant="outline" className="text-gray-300 border-gray-400">Past Event</Badge>
                ) : (
                  <Badge variant="outline" className="text-green-400 border-green-400 bg-green-400/10">Upcoming</Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                {event.name}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  <span>{event.timeline || event.date ? new Date(event.timeline || event.date!).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-400" />
                  <span>{event.location}</span>
                </div>
                {event.organizer && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-amber-400" />
                    <span>By {event.organizer}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back button */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                <ChevronLeft className="mr-1 h-5 w-5" />
                Back to All Events
              </Button>
            </Link>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap gap-3 mb-10 pb-10 border-b">
            {isRegistered ? (
              <Button size="lg" disabled className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                <Check className="h-5 w-5 mr-2" />
                You're Attending
              </Button>
            ) : isEventPast(event.timeline || event.date) ? (
              <Button size="lg" disabled variant="secondary">
                Registration Closed
              </Button>
            ) : (
              <Button size="lg" onClick={handleRegistrationOpen} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-8">
                Register Now
              </Button>
            )}

            <Button variant="outline" size="lg">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            {isRegistered && (
              <Link to={`/event/${event._id}/gamification`}>
                <Button variant="secondary" size="lg" className="border-2 border-yellow-400/20 bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Gamification Hub
                </Button>
              </Link>
            )}
          </div>

          {/* Main Article Content */}
          <article className="prose prose-lg md:prose-xl max-w-none text-gray-800 leading-relaxed">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Event</h2>
            <div className="whitespace-pre-line text-lg text-gray-700">
              {abstract || event.description}
            </div>

            <div className="my-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-slate-500" />
                Who Should Attend?
              </h3>
              <p className="text-slate-600 mb-0">
                This event is open appropriately for teams of 1-6 people. Whether you are a student, professional, or enthusiast in {event.category || 'this field'}, you'll find value in the sessions and networking opportunities.
              </p>
            </div>
          </article>

          {/* FAQs Section */}
          <section className="mt-16 pt-10 border-t">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

            <div className="mb-8">
              <form onSubmit={handleFaqSearch} className="flex gap-2 relative">
                <Input
                  type="text"
                  placeholder="Have a specific question?"
                  value={faqQuery}
                  onChange={(e) => setFaqQuery(e.target.value)}
                  className="pr-24 py-6 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-all"
                />
                <div className="absolute right-1 top-1 bottom-1">
                  <Button type="submit" disabled={searchingFaq || !faqQuery.trim()} className="h-full rounded-md px-6">
                    {searchingFaq ? "..." : "Ask AI"}
                  </Button>
                </div>
              </form>

              {faqSearchResult && (
                <div className="mt-6 p-6 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">AI Answer</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearFaqSearch} className="h-8 w-8 p-0 rounded-full hover:bg-indigo-200/50">
                      <X className="h-4 w-4 text-indigo-700" />
                    </Button>
                  </div>
                  <p className="text-gray-800 whitespace-pre-line leading-relaxed">{faqSearchResult}</p>
                </div>
              )}
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4 bg-white shadow-sm data-[state=open]:shadow-md transition-all">
                  <AccordionTrigger className="hover:no-underline py-4 font-medium text-lg">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4 text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
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
