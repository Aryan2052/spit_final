import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  Tooltip, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";

const Analytics = () => {
  const [feedbackAnalysis, setFeedbackAnalysis] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    attendees: [],
  });
  const [eventMetrics, setEventMetrics] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [attendanceByMonth, setAttendanceByMonth] = useState([]);
  const [feedbackCategories, setFeedbackCategories] = useState([]);

  const fetchFeedbackAnalysis = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/feedback/analysis");
      setFeedbackAnalysis(response.data);
    } catch (error) {
      console.error("Error fetching feedback analysis:", error);
    }
  };

  useEffect(() => {
    fetchFeedbackAnalysis();
    
    // Hard-coded data for visualizations
    setRatingDistribution([
      { name: "1 Star", value: 5 },
      { name: "2 Stars", value: 10 },
      { name: "3 Stars", value: 15 },
      { name: "4 Stars", value: 25 },
      { name: "5 Stars", value: 45 },
    ]);
    
    setEventMetrics([
      { name: "Tech Talks", attendees: 120, applications: 150, feedback: 80 },
      { name: "Workshops", attendees: 85, applications: 100, feedback: 65 },
      { name: "Hackathons", attendees: 200, applications: 250, feedback: 180 },
      { name: "Seminars", attendees: 75, applications: 90, feedback: 60 },
      { name: "Networking", attendees: 50, applications: 60, feedback: 40 },
    ]);
    
    setAttendanceByMonth([
      { name: "Jan", attendance: 65 },
      { name: "Feb", attendance: 80 },
      { name: "Mar", attendance: 110 },
      { name: "Apr", attendance: 95 },
      { name: "May", attendance: 130 },
      { name: "Jun", attendance: 115 },
      { name: "Jul", attendance: 85 },
      { name: "Aug", attendance: 100 },
      { name: "Sep", attendance: 120 },
      { name: "Oct", attendance: 140 },
      { name: "Nov", attendance: 95 },
      { name: "Dec", attendance: 70 },
    ]);
    
    setFeedbackCategories([
      { subject: "Content Quality", A: 4.2, fullMark: 5 },
      { subject: "Speaker Engagement", A: 3.8, fullMark: 5 },
      { subject: "Organization", A: 4.5, fullMark: 5 },
      { subject: "Venue", A: 3.9, fullMark: 5 },
      { subject: "Networking", A: 4.1, fullMark: 5 },
      { subject: "Value", A: 4.3, fullMark: 5 },
    ]);
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-4">
              Data Insights
            </span>
            <h1 className="text-4xl font-bold mb-4">Analytics Dashboard</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time data visualization for attendance, engagement, and sentiment tracking
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card card-3d-effect">
              <CardContent className="p-6">
                <h3 className="text-muted-foreground text-sm">Total Feedback Responses</h3>
                <div className="text-3xl font-bold mt-1">{feedbackAnalysis.totalFeedbacks}</div>
              </CardContent>
            </Card>
            <Card className="glass-card card-3d-effect">
              <CardContent className="p-6">
                <h3 className="text-muted-foreground text-sm">Average Rating</h3>
                <div className="text-3xl font-bold mt-1">{feedbackAnalysis.averageRating.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card className="glass-card card-3d-effect">
              <CardContent className="p-6">
                <h3 className="text-muted-foreground text-sm">Total Events</h3>
                <div className="text-3xl font-bold mt-1">{eventMetrics.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Rating Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="glass-card card-3d-effect">
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Breakdown of feedback ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ratingDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Attendance Trend */}
            <Card className="glass-card card-3d-effect">
              <CardHeader>
                <CardTitle>Monthly Attendance Trend</CardTitle>
                <CardDescription>Event attendance over the year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={attendanceByMonth}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="attendance" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Metrics Bar Chart */}
          <Card className="glass-card card-3d-effect mb-12">
            <CardHeader>
              <CardTitle>Event Performance Metrics</CardTitle>
              <CardDescription>Comparison of attendees, applications, and feedback across event types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={eventMetrics}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attendees" fill="#8884d8" />
                    <Bar dataKey="applications" fill="#82ca9d" />
                    <Bar dataKey="feedback" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Categories Radar Chart */}
          <Card className="glass-card card-3d-effect mb-12">
            <CardHeader>
              <CardTitle>Feedback Category Ratings</CardTitle>
              <CardDescription>Average ratings across different aspects of events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={feedbackCategories}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                    <Radar name="Average Rating" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Attendees Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Recent Attendee Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbackAnalysis.attendees.slice(0, 6).map((attendee, index) => (
                <Card key={index} className="glass-card card-3d-effect">
                  <CardContent className="p-4">
                    <h3 className="font-medium">Event ID: {attendee.eventId}</h3>
                    <p className="text-sm text-muted-foreground">{attendee.suggestions || "No suggestions provided"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analytics;