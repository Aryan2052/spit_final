import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingDown, 
  Calendar, 
  Lightbulb, 
  PieChart, 
  CreditCard,
  BarChart,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  quantity: number;
  totalCost: number;
  alternatives?: Alternative[];
  isProcessing?: boolean;
  isOptimized?: boolean;
}

interface Alternative {
  description: string;
  originalCost: number;
  suggestedCost: number;
  savings: number;
  reason: string;
  source?: string;
}

interface BudgetSummary {
  totalOriginal: number;
  totalOptimized: number;
  totalSavings: number;
  savingsPercentage: number;
  categories: {
    [key: string]: {
      original: number;
      optimized: number;
      savings: number;
    }
  }
}

interface Event {
  _id: string;
  name: string;
  description: string;
  date?: string;
  timeline?: string;
  location: string;
}

const BudgetOptimization = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<BudgetItem, 'id' | 'totalCost'>>({
    category: 'Venue',
    description: '',
    amount: 0,
    quantity: 1
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('budget-planner');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [attendees, setAttendees] = useState(100);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    totalOriginal: 0,
    totalOptimized: 0,
    totalSavings: 0,
    savingsPercentage: 0,
    categories: {}
  });
  
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

  const categories = [
    'Venue', 
    'Catering', 
    'Decor', 
    'Marketing', 
    'Technology', 
    'Entertainment', 
    'Staff', 
    'Transportation', 
    'Accommodations',
    'Miscellaneous'
  ];

  useEffect(() => {
    // Calculate budget summary whenever budget items change
    calculateBudgetSummary();
  }, [budgetItems]);

  useEffect(() => {
    // Fetch events when component mounts
    fetchEvents();
  }, []);

  useEffect(() => {
    // Update event details when a different event is selected
    if (selectedEventId) {
      const selectedEvent = events.find(event => event._id === selectedEventId);
      if (selectedEvent) {
        setEventName(selectedEvent.name);
        setEventDescription(selectedEvent.description || '');
        
        // Set event date from timeline or date property
        const dateString = selectedEvent.date || selectedEvent.timeline;
        if (dateString) {
          // Format the date for the input (YYYY-MM-DD)
          try {
            const eventDate = new Date(dateString);
            setEventDate(eventDate.toISOString().split('T')[0]);
          } catch (error) {
            console.error('Error parsing date:', error);
          }
        }
      }
    }
  }, [selectedEventId, events]);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await fetch("http://localhost:5000/api/events");
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const calculateBudgetSummary = () => {
    const summary: BudgetSummary = {
      totalOriginal: 0,
      totalOptimized: 0,
      totalSavings: 0,
      savingsPercentage: 0,
      categories: {}
    };

    // Initialize categories
    categories.forEach(category => {
      summary.categories[category] = {
        original: 0,
        optimized: 0,
        savings: 0
      };
    });

    // Calculate totals
    budgetItems.forEach(item => {
      const originalCost = item.totalCost;
      summary.totalOriginal += originalCost;
      summary.categories[item.category].original += originalCost;

      if (item.alternatives && item.alternatives.length > 0) {
        // Get the best alternative
        const bestAlternative = item.alternatives.reduce((best, current) => 
          current.savings > best.savings ? current : best, item.alternatives[0]);
        
        const optimizedCost = bestAlternative.suggestedCost * item.quantity;
        const savings = originalCost - optimizedCost;
        
        summary.totalOptimized += optimizedCost;
        summary.totalSavings += savings;
        
        summary.categories[item.category].optimized += optimizedCost;
        summary.categories[item.category].savings += savings;
      } else {
        // If no alternatives, use original cost
        summary.totalOptimized += originalCost;
        summary.categories[item.category].optimized += originalCost;
      }
    });

    // Calculate savings percentage
    if (summary.totalOriginal > 0) {
      summary.savingsPercentage = (summary.totalSavings / summary.totalOriginal) * 100;
    }

    setBudgetSummary(summary);
  };

  const handleAddItem = () => {
    if (!newItem.description || newItem.amount <= 0) return;
    
    const item: BudgetItem = {
      id: Date.now().toString(),
      ...newItem,
      totalCost: newItem.amount * newItem.quantity
    };
    
    setBudgetItems([...budgetItems, item]);
    
    // Reset form
    setNewItem({
      category: 'Venue',
      description: '',
      amount: 0,
      quantity: 1
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount' || name === 'quantity') {
      setNewItem({
        ...newItem,
        [name]: parseFloat(value) || 0
      });
    } else {
      setNewItem({
        ...newItem,
        [name]: value
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const findAlternatives = async (itemId: string) => {
    const item = budgetItems.find(item => item.id === itemId);
    if (!item || !genAI) return;

    // Mark item as processing
    setBudgetItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, isProcessing: true } : i
    ));

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are an expert event budget optimizer with extensive knowledge of cost-effective alternatives.

Event Details:
- Name: ${eventName || 'Campus Event'}
- Date: ${eventDate || 'Upcoming'}
- Description: ${eventDescription || 'A campus event'}
- Expected Attendees: ${attendees}

Please analyze this budget item and suggest 3 cost-effective alternatives:
- Category: ${item.category}
- Item: ${item.description}
- Current Cost: ₹${item.amount} per unit (Quantity: ${item.quantity})
- Total Cost: ₹${item.totalCost}

For each alternative, provide:
1. A specific description of the alternative (be specific with brand, model, or vendor when applicable)
2. The suggested cost per unit (in ₹)
3. A brief explanation of why this is a good alternative
4. When possible, include where this alternative can be found

Format your response as valid JSON:
[
  {
    "description": "Alternative 1 name",
    "originalCost": ${item.amount},
    "suggestedCost": 000,
    "savings": 000,
    "reason": "Explanation of benefits",
    "source": "Where to find it (if applicable)"
  },
  {...}
]`;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      // Extract JSON from the response
      const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          const alternatives = JSON.parse(jsonMatch[0]);
          // Calculate savings for each alternative
          const processedAlternatives = alternatives.map((alt: Alternative) => ({
            ...alt,
            savings: (alt.originalCost - alt.suggestedCost) * item.quantity
          }));
          
          // Update the item with alternatives
          setBudgetItems(prev => prev.map(i => 
            i.id === itemId ? { 
              ...i, 
              alternatives: processedAlternatives,
              isProcessing: false,
              isOptimized: true 
            } : i
          ));
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          setBudgetItems(prev => prev.map(i => 
            i.id === itemId ? { ...i, isProcessing: false } : i
          ));
        }
      } else {
        console.error("No JSON found in response");
        setBudgetItems(prev => prev.map(i => 
          i.id === itemId ? { ...i, isProcessing: false } : i
        ));
      }
    } catch (error) {
      console.error("Error generating alternatives:", error);
      setBudgetItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, isProcessing: false } : i
      ));
    }
  };

  const optimizeAllItems = async () => {
    setIsGenerating(true);
    
    // Get all items without alternatives
    const unoptimizedItems = budgetItems.filter(item => !item.isOptimized);
    
    for (const item of unoptimizedItems) {
      await findAlternatives(item.id);
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsGenerating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-4">
              AI-Powered
            </span>
            <h1 className="text-4xl font-bold mb-4">Predictive Budget Optimization</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Optimize your event budget with AI-driven recommendations for cost-effective alternatives
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="budget-planner">
                <DollarSign className="mr-2 h-4 w-4" />
                Budget Planner
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <PieChart className="mr-2 h-4 w-4" />
                Savings Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="budget-planner">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>
                    Provide information about your event to receive more accurate recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Event</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        disabled={loadingEvents}
                      >
                        <option value="">-- Select an event --</option>
                        {events.map(event => (
                          <option key={event._id} value={event._id}>
                            {event.name}
                          </option>
                        ))}
                      </select>
                      {loadingEvents && (
                        <p className="text-xs text-muted-foreground mt-1">Loading events...</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Event Date</label>
                      <Input 
                        type="date" 
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Event Description</label>
                    <Textarea 
                      placeholder="Briefly describe your event" 
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expected Attendees</label>
                    <Input 
                      type="number" 
                      placeholder="Enter number of attendees"
                      value={attendees.toString()}
                      onChange={(e) => setAttendees(parseInt(e.target.value) || 0)}
                      min={1}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Budget Items</CardTitle>
                  <CardDescription>
                    Add items to your budget and receive AI-driven cost-saving recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium mb-1 block">Category</label>
                      <select 
                        name="category"
                        value={newItem.category}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-1 block">Description</label>
                      <Input 
                        name="description"
                        placeholder="Item description" 
                        value={newItem.description}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cost (₹)</label>
                      <Input 
                        name="amount"
                        type="number" 
                        placeholder="Cost per unit"
                        value={newItem.amount === 0 ? '' : newItem.amount.toString()}
                        onChange={handleInputChange}
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Quantity</label>
                      <Input 
                        name="quantity"
                        type="number" 
                        placeholder="Quantity"
                        value={newItem.quantity.toString()}
                        onChange={handleInputChange}
                        min={1}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mb-6">
                    <Button onClick={handleAddItem}>Add Item</Button>
                  </div>

                  {budgetItems.length > 0 ? (
                    <div className="space-y-6">
                      {budgetItems.map(item => (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="p-4 bg-muted/30 flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{item.description}</h3>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(item.totalCost)}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(item.amount)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          
                          {item.isProcessing && (
                            <div className="p-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <RefreshCw className="animate-spin h-4 w-4" />
                                <span>Finding alternatives...</span>
                              </div>
                            </div>
                          )}
                          
                          {item.alternatives && item.alternatives.length > 0 && (
                            <div className="p-4">
                              <h4 className="font-medium mb-2 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                                Recommended Alternatives
                              </h4>
                              <div className="space-y-3">
                                {item.alternatives.map((alt, index) => (
                                  <div key={index} className="bg-muted/20 p-3 rounded-md">
                                    <div className="flex justify-between">
                                      <h5 className="font-medium">{alt.description}</h5>
                                      <span className="text-green-600 font-semibold flex items-center">
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                        Save {formatCurrency(alt.savings)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                      <span>{formatCurrency(alt.suggestedCost)} per unit</span>
                                      <span className="text-muted-foreground">
                                        Total: {formatCurrency(alt.suggestedCost * item.quantity)}
                                      </span>
                                    </div>
                                    <p className="text-sm mt-2">{alt.reason}</p>
                                    {alt.source && (
                                      <p className="text-xs text-blue-600 mt-1">Source: {alt.source}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="p-4 bg-muted/10 flex justify-between">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              Remove
                            </Button>
                            
                            {!item.isOptimized && !item.isProcessing && (
                              <Button
                                size="sm"
                                onClick={() => findAlternatives(item.id)}
                              >
                                Find Alternatives
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                      
                      <div className="flex justify-between mt-6">
                        <div className="text-xl font-semibold">
                          Total Budget: {formatCurrency(budgetSummary.totalOriginal)}
                        </div>
                        <Button 
                          onClick={optimizeAllItems}
                          disabled={isGenerating || budgetItems.every(item => item.isOptimized)}
                          className="gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="animate-spin h-4 w-4" />
                              Optimizing...
                            </>
                          ) : (
                            <>
                              <Lightbulb className="h-4 w-4" />
                              Optimize All
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-md">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/60" />
                      <h3 className="mt-4 text-lg font-medium">No budget items yet</h3>
                      <p className="text-muted-foreground">Add items to your budget to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Optimization Summary</CardTitle>
                  <CardDescription>
                    Overview of potential savings with AI-recommended alternatives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {budgetItems.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-muted/20">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <h3 className="text-lg font-medium">Original Budget</h3>
                              <p className="text-3xl font-bold mt-2">{formatCurrency(budgetSummary.totalOriginal)}</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-muted/20">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-green-600" />
                              <h3 className="text-lg font-medium">Potential Savings</h3>
                              <p className="text-3xl font-bold mt-2 text-green-600">
                                {formatCurrency(budgetSummary.totalSavings)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {budgetSummary.savingsPercentage.toFixed(1)}% of budget
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-muted/20">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                              <h3 className="text-lg font-medium">Optimized Budget</h3>
                              <p className="text-3xl font-bold mt-2">{formatCurrency(budgetSummary.totalOptimized)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Savings by Category</h3>
                        <div className="space-y-4">
                          {Object.entries(budgetSummary.categories)
                            .filter(([_, values]) => values.original > 0)
                            .sort((a, b) => b[1].savings - a[1].savings)
                            .map(([category, values]) => {
                              const savingsPercentage = values.original > 0 
                                ? (values.savings / values.original) * 100 
                                : 0;
                              
                              return (
                                <div key={category}>
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">{category}</span>
                                    <span className="text-green-600">
                                      Save {formatCurrency(values.savings)} ({savingsPercentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                    <span>Original: {formatCurrency(values.original)}</span>
                                    <span>Optimized: {formatCurrency(values.optimized)}</span>
                                  </div>
                                  <Progress value={savingsPercentage} className="h-2" />
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      
                      {budgetItems.some(item => !item.isOptimized) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Optimization Incomplete</h4>
                            <p className="text-sm text-yellow-700">
                              Some budget items haven't been optimized yet. Click "Optimize All" to find alternatives for all items.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-md">
                      <BarChart className="h-12 w-12 mx-auto text-muted-foreground/60" />
                      <h3 className="mt-4 text-lg font-medium">No analytics available</h3>
                      <p className="text-muted-foreground">Add budget items to see potential savings</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BudgetOptimization;
