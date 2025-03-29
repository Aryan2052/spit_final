
import React, { useState } from 'react';
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
  Search
} from 'lucide-react';

const Engagement = () => {
  const [activeTab, setActiveTab] = useState("registration");
  const [message, setMessage] = useState("");
  
  // Mock attendee data
  const attendees = [
    { id: 1, name: "Alex Johnson", university: "State University", interests: ["Technology", "Design"], avatar: "AJ" },
    { id: 2, name: "Taylor Smith", university: "City College", interests: ["Marketing", "Leadership"], avatar: "TS" },
    { id: 3, name: "Jamie Wilson", university: "Tech Institute", interests: ["Engineering", "Robotics"], avatar: "JW" },
    { id: 4, name: "Casey Morgan", university: "Community College", interests: ["Art", "Music"], avatar: "CM" },
    { id: 5, name: "Riley Peterson", university: "Liberal Arts School", interests: ["Literature", "History"], avatar: "RP" },
    { id: 6, name: "Jordan Lee", university: "Business Academy", interests: ["Finance", "Entrepreneurship"], avatar: "JL" },
  ];
  
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
          
          <Tabs defaultValue="registration" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full max-w-2xl">
                <TabsTrigger value="registration" className="py-3">
                  <UserPlus className="h-4 w-4 mr-2" /> Registration
                </TabsTrigger>
                <TabsTrigger value="ticketing" className="py-3">
                  <Ticket className="h-4 w-4 mr-2" /> Ticketing
                </TabsTrigger>
                <TabsTrigger value="networking" className="py-3">
                  <Users className="h-4 w-4 mr-2" /> Networking
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Registration Tab */}
            <TabsContent value="registration" className="animate-fade-in">
              <Card className="glass-card card-3d-effect border-0">
                <CardHeader>
                  <CardTitle>Event Registration Form</CardTitle>
                  <CardDescription>
                    Register for our upcoming campus event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                        <Input id="firstName" placeholder="Enter your first name" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                        <Input id="lastName" placeholder="Enter your last name" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input id="email" type="email" placeholder="your.email@university.edu" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="university" className="text-sm font-medium">University/College</label>
                      <Input id="university" placeholder="Enter your university or college" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="interests" className="text-sm font-medium">Areas of Interest</label>
                      <div className="flex flex-wrap gap-2">
                        {["Technology", "Business", "Arts", "Science", "Engineering", "Humanities"].map((interest) => (
                          <div key={interest} className="flex items-center">
                            <input type="checkbox" id={interest} className="mr-2" />
                            <label htmlFor={interest} className="text-sm">{interest}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="dietaryRestrictions" className="text-sm font-medium">Dietary Restrictions</label>
                      <Input id="dietaryRestrictions" placeholder="List any dietary restrictions" />
                    </div>
                    
                    <div className="flex items-center">
                      <input type="checkbox" id="notifications" className="mr-2" />
                      <label htmlFor="notifications" className="text-sm">
                        I would like to receive email updates about this event
                      </label>
                    </div>
                    
                    <Button className="w-full">Register Now</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Ticketing Tab */}
            <TabsContent value="ticketing" className="animate-fade-in">
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
                    <div className="text-3xl font-bold mb-4">$0</div>
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
                    <Button className="w-full">Get Ticket</Button>
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
                    <div className="text-3xl font-bold mb-4">$15</div>
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
                    <Button className="w-full" variant="default">Get Ticket</Button>
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
                    <div className="text-3xl font-bold mb-4">$30</div>
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
                    <Button className="w-full">Get Ticket</Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="mt-8">
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
                        <h3 className="font-semibold mb-4">Spring Tech Festival 2023</h3>
                        <p className="text-muted-foreground mb-6">
                          Join us for a day of innovation, learning, and networking at our annual Spring Tech Festival!
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-primary" />
                            <span>April 15, 2023 | 10:00 AM - 6:00 PM</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-primary" />
                            <span>University Conference Center, Building 4</span>
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
                <Card className="glass-card card-3d-effect border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Event Chat
                    </CardTitle>
                    <CardDescription>
                      Connect with other attendees and ask questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-background/80 rounded-lg p-4 h-64 mb-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>MJ</AvatarFallback>
                          </Avatar>
                          <div className="bg-primary/10 p-3 rounded-lg rounded-tl-none">
                            <p className="text-sm font-medium">Morgan J.</p>
                            <p className="text-sm">Hi everyone! Excited for the tech panel at 2PM. Anyone else going?</p>
                            <p className="text-xs text-muted-foreground mt-1">10:30 AM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>TS</AvatarFallback>
                          </Avatar>
                          <div className="bg-primary/10 p-3 rounded-lg rounded-tl-none">
                            <p className="text-sm font-medium">Taylor S.</p>
                            <p className="text-sm">I'll be there! Does anyone know if they'll be discussing AR applications?</p>
                            <p className="text-xs text-muted-foreground mt-1">10:32 AM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>AJ</AvatarFallback>
                          </Avatar>
                          <div className="bg-primary/10 p-3 rounded-lg rounded-tl-none">
                            <p className="text-sm font-medium">Alex J.</p>
                            <p className="text-sm">Yes, AR is on the agenda! Looking forward to meeting everyone there.</p>
                            <p className="text-xs text-muted-foreground mt-1">10:35 AM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Type your message..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <Button size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Engagement;
