import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Ticket, 
  MessageSquare, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  Users,
  Send,
  Search,
  Clock,
  X
} from 'lucide-react';
import DiscussionForum from '@/components/DiscussionForum';
import PaymentModal from '../components/PaymentModal';

// Define interfaces
interface Event {
  _id: string;
  name: string;
  description: string;
  timeline: string;
  location: string;
}

interface PayUOptions {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
}

const Engagement = () => {
  const [activeTab, setActiveTab] = useState("ticketing");
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentTicketType, setPaymentTicketType] = useState('');
  
  // Mock attendee data
  const attendees = [
    { id: 1, name: "Alex Johnson", university: "State University", interests: ["Technology", "Design"], avatar: "AJ" },
    { id: 2, name: "Taylor Smith", university: "City College", interests: ["Marketing", "Leadership"], avatar: "TS" },
    { id: 3, name: "Jamie Wilson", university: "Tech Institute", interests: ["Engineering", "Robotics"], avatar: "JW" },
    { id: 4, name: "Casey Morgan", university: "Community College", interests: ["Art", "Music"], avatar: "CM" },
    { id: 5, name: "Riley Peterson", university: "Liberal Arts School", interests: ["Literature", "History"], avatar: "RP" },
    { id: 6, name: "Jordan Lee", university: "Business Academy", interests: ["Finance", "Entrepreneurship"], avatar: "JL" },
  ];
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/events");
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch events');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const makePayment = async (amount, ticketType) => {
    setPaymentAmount(amount);
    setPaymentTicketType(ticketType);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-4">
              Attendee Experience
            </span>
            <h1 className="text-4xl font-bold mb-4">Attendee Engagement Hub</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Seamless registration, ticketing, and networking opportunities for participants
            </p>
          </div>
          
          <Tabs defaultValue="ticketing" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-1 sm:grid-cols-2 w-full max-w-2xl">
                <TabsTrigger value="ticketing" className="py-3">
                  <Ticket className="h-4 w-4 mr-2" /> Ticketing
                </TabsTrigger>
                <TabsTrigger value="networking" className="py-3">
                  <Users className="h-4 w-4 mr-2" /> Networking
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Ticketing Tab */}
            <TabsContent value="ticketing" className="animate-fade-in">
              {/* Upcoming Events Section */}
              <div className="mb-12 relative">
                <button 
                  className="absolute top-0 right-0 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
                  onClick={() => window.history.back()}
                  aria-label="Close ticketing page"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
                {loading ? (
                  <div className="text-center">
                    <Clock className="h-8 w-8 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <Card key={event._id} className="glass-card card-3d-effect border-0 cursor-pointer hover:shadow-lg transition-all">
                        <div className="h-40 bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-primary" />
                        </div>
                        <CardHeader>
                          <CardTitle>{event.name}</CardTitle>
                          <CardDescription>{event.timeline}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">{event.location}</p>
                          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Tickets Available</Badge>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full" onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}>View Event Details</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Ticket Section */}
              {selectedEvent && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Tickets for: {selectedEvent.name}</h2>
                  <div className="mb-6 p-4 bg-primary/5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">About This Event</h3>
                    <p className="text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass-card card-3d-effect border-0">
                      <div className="h-2 bg-blue-500"></div>
                      <CardHeader>
                        <CardTitle>Standard Ticket</CardTitle>
                        <CardDescription>
                          Basic access to the main event
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">₹0</div>
                        <ul className="space-y-2">
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            Main event access
                          </li>
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            Digital program
                          </li>
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            General seating
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => makePayment(0, 'Standard')}
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <div className="flex items-center justify-center">
                              <Clock className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </div>
                          ) : (
                            <div>Register Free</div>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="glass-card card-3d-effect border-0 relative">
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary text-white">Popular</Badge>
                      </div>
                      <div className="h-2 bg-primary"></div>
                      <CardHeader>
                        <CardTitle>Premium Ticket</CardTitle>
                        <CardDescription>
                          Enhanced experience with extra perks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">₹499</div>
                        <ul className="space-y-2">
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            All Standard features
                          </li>
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            Priority seating
                          </li>
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            Networking reception access
                          </li>
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            Swag bag
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => makePayment(499, 'Premium')}
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <div className="flex items-center justify-center">
                              <Clock className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </div>
                          ) : (
                            <div>Pay ₹499</div>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="glass-card card-3d-effect border-0">
                      <div className="h-2 bg-purple-500"></div>
                      <CardHeader>
                        <CardTitle>VIP Ticket</CardTitle>
                        <CardDescription>
                          Complete experience with exclusive benefits
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">₹999</div>
                        <ul className="space-y-2">
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            All Premium features
                          </li>
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            VIP lounge access
                          </li>
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            Meet & greet with speakers
                          </li>
                          <li className="flex items-center text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                            Exclusive after-party
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => makePayment(999, 'VIP')}
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <div className="flex items-center justify-center">
                              <Clock className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </div>
                          ) : (
                            <div>Pay ₹999</div>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              )}
              
              <div className="mt-8">
                {selectedEvent && (
                  <Card className="glass-card card-3d-effect border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        Event Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-4">{selectedEvent.name}</h3>
                          <p className="text-muted-foreground mb-6">
                            Join us for a day of innovation, learning, and networking at our annual Spring Tech Festival!
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-2 h-4 w-4 text-primary" />
                              <span>{selectedEvent.timeline}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="mr-2 h-4 w-4 text-primary" />
                              <span>{selectedEvent.location}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-4 w-4 text-primary" />
                              <span>events@university.edu</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="mr-2 h-4 w-4 text-primary" />
                              <span>(555) 123-4567</span>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 h-48 flex items-center justify-center text-center p-4">
                          <div>
                            <div className="font-semibold mb-2">Interactive Event Map</div>
                            <div className="text-sm text-muted-foreground">
                              Click to view detailed venue map with
                              session locations and amenities
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Networking Tab */}
            <TabsContent value="networking" className="animate-fade-in">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Attendee Directory</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Search attendees..." className="pl-10 w-64" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attendees.map((attendee) => (
                    <Card key={attendee.id} className="glass-card card-3d-effect border-0">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback>{attendee.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{attendee.name}</h3>
                            <p className="text-sm text-muted-foreground">{attendee.university}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Interests:</div>
                          <div className="flex flex-wrap gap-2">
                            {attendee.interests.map((interest) => (
                              <Badge key={interest} variant="secondary" className="bg-primary/10 text-primary">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <Button variant="outline" size="sm">View Profile</Button>
                          <Button size="sm">Connect</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="mt-12">
                <DiscussionForum />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      
      {/* Event Details Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center">
          <div className="max-w-2xl w-full bg-white rounded-lg p-8 relative">
            <button 
              className="absolute top-4 right-4"
              onClick={() => setShowEventModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedEvent?.name}</h2>
            <p className="text-muted-foreground mb-6">{selectedEvent?.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card card-3d-effect border-0">
                <div className="h-2 bg-blue-500"></div>
                <CardHeader>
                  <CardTitle>Standard Ticket</CardTitle>
                  <CardDescription>
                    Basic access to the main event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">₹0</div>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      Main event access
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      Digital program
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      General seating
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => makePayment(0, 'Standard')}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <div className="flex items-center justify-center">
                        <Clock className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <div>Register Free</div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="glass-card card-3d-effect border-0 relative">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-white">Popular</Badge>
                </div>
                <div className="h-2 bg-primary"></div>
                <CardHeader>
                  <CardTitle>Premium Ticket</CardTitle>
                  <CardDescription>
                    Enhanced experience with extra perks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">₹499</div>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      All Standard features
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      Priority seating
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      Networking reception access
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      Swag bag
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => makePayment(499, 'Premium')}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <div className="flex items-center justify-center">
                        <Clock className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <div>Pay ₹499</div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="glass-card card-3d-effect border-0">
                <div className="h-2 bg-purple-500"></div>
                <CardHeader>
                  <CardTitle>VIP Ticket</CardTitle>
                  <CardDescription>
                    Complete experience with exclusive benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">₹999</div>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      All Premium features
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      VIP lounge access
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      Meet & greet with speakers
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2">✓</div>
                      Exclusive after-party
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => makePayment(999, 'VIP')}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <div className="flex items-center justify-center">
                        <Clock className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <div>Pay ₹999</div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      )}
      
      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal}
          amount={paymentAmount}
          ticketType={paymentTicketType}
          eventName={selectedEvent?.name || 'Campus Event'}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={() => {
            setProcessingPayment(false);
            setShowEventModal(false);
            setShowPaymentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Engagement;
