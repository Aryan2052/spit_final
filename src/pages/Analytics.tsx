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
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from "recharts";

const Analytics = () => {
  const [feedbackAnalysis, setFeedbackAnalysis] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    attendees: [],
  });

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
  }, []);

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

          {/* Feedback Analysis */}
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
          </div>

          {/* Attendees Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Attendees</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbackAnalysis.attendees.map((attendee, index) => (
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