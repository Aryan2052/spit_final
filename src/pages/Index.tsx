import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Users, MessageSquare, Calendar, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import FeatureSection from "../components/FeatureSection";
import FeedbackForm from "../components/FeedbackForm";

type Event = {
  _id: string;
  name: string;
  description: string;
  timeline: string;
  location: string;
  image: string;
  organizer: string;
};

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch events from the backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Hero />
        <FeatureSection />

        {/* Events Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Explore the latest events happening in your organization.
              </p>
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-4 pl-4 pr-12 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading events...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">
                      {searchTerm
                        ? "No events found matching your search."
                        : "No events available at the moment."}
                    </p>
                  </div>
                ) : (
                  filteredEvents.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col cursor-pointer"
                      onClick={() => {
                        // Navigate to event info page
                        window.location.href = `/event/${event._id}`;
                      }}
                    >
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.name}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-event.svg';
                          }}
                        />
                      </div>
                      <div className="p-6 flex-grow">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">
                          {event.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {event.description}
                        </p>
                        <div className="space-y-2 mt-auto">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(event.timeline).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(event.timeline).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 mt-2 pt-2 border-t">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Organized by {event.organizer}</span>
                          </div>
                          <div className="mt-4 pt-2 border-t flex justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                setSelectedEventId(event._id);
                              }}
                              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm font-medium">Provide Feedback</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Feedback Form Modal */}
      {selectedEventId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Provide Feedback</h2>
            <FeedbackForm eventId={selectedEventId} onClose={() => setSelectedEventId(null)} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Index;