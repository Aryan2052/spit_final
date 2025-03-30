import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, MapPin, Clock, Users, ChevronLeft, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

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
}

interface FAQ {
  question: string;
  answer: string;
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
    }
  ]);
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);
        
        // Generate abstract and FAQs using Gemini API
        generateAbstractAndFAQs(response.data.name, response.data.description);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);
  
  const generateAbstractAndFAQs = async (title: string, description: string) => {
    try {
      // Generate abstract
      const abstractPrompt = `Generate a detailed abstract (minimum 150 words) for an event titled "${title}" with the following description: "${description}". The abstract should be engaging and informative, highlighting the key aspects of the event.`;
      const abstractResponse = await axios.post('http://localhost:5000/api/gemini/generate', {
        prompt: abstractPrompt
      });
      
      if (abstractResponse.data && abstractResponse.data.text) {
        setAbstract(abstractResponse.data.text);
      }
      
      // Generate FAQs
      const faqPrompt = `Generate 2 frequently asked questions with answers related to an event titled "${title}" with the following description: "${description}". The questions should be specific to this type of event and provide helpful information for potential attendees. Format the output as JSON with an array of objects, each with 'question' and 'answer' fields.`;
      const faqResponse = await axios.post('http://localhost:5000/api/gemini/generate', {
        prompt: faqPrompt,
        format: 'json'
      });
      
      if (faqResponse.data && faqResponse.data.text) {
        try {
          const generatedFaqs = JSON.parse(faqResponse.data.text);
          setFaqs([...faqs, ...generatedFaqs]);
        } catch (e) {
          console.error('Error parsing generated FAQs:', e);
          // If parsing fails, create some default dynamic FAQs based on the event
          const defaultDynamicFaqs = [
            {
              question: `What can I expect to learn at ${title}?`,
              answer: `At ${title}, you'll gain insights into the latest trends and techniques related to this field. The event will cover various aspects mentioned in the description and provide opportunities for networking and skill development.`
            },
            {
              question: 'How should I prepare for this event?',
              answer: 'Come with an open mind and be ready to collaborate. Bringing your laptop and any relevant tools would be beneficial. Prior knowledge of the subject matter is helpful but not required.'
            }
          ];
          setFaqs([...faqs, ...defaultDynamicFaqs]);
        }
      }
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      // Use fallback content if API fails
      const fallbackAbstract = `This exciting event brings together professionals and enthusiasts to explore cutting-edge concepts and techniques. Participants will have the opportunity to network, learn from experts, and engage in hands-on activities. The event is designed to foster collaboration and innovation, providing a platform for attendees to share ideas and develop new skills. Whether you're a beginner or an experienced practitioner, this event offers valuable insights and practical knowledge that you can apply in your field. Join us for an enriching experience that combines learning, networking, and fun in a supportive environment.`;
      setAbstract(fallbackAbstract);
    }
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
                  <Badge className="bg-primary/10 text-primary">Hackathon</Badge>
                  <Badge className="bg-green-500/10 text-green-500">Registration Open</Badge>
                </div>
                
                <div className="flex space-x-3">
                  <Button>Register Now</Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
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
                {abstract ? (
                  <p>{abstract}</p>
                ) : (
                  <p>{event.description}</p>
                )}
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
    </div>
  );
};

export default EventInfo;
