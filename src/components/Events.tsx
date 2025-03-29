import React, { useState } from "react";
import FeedbackForm from "../components/FeedbackForm";
import { Calendar, MapPin, User } from 'lucide-react';

type EventProps = {
  eventId: string;
  name: string;
  description: string;
  date: string;
  location: string;
  image: string;
  organizer: string;
};

const Events: React.FC<EventProps> = ({ 
  eventId, 
  name, 
  description, 
  date, 
  location, 
  image, 
  organizer 
}) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <div className="mb-4">
        <img
          src={image || '/placeholder-event.svg'}
          alt={name}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{date}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <User className="w-4 h-4 mr-2" />
          <span>{organizer}</span>
        </div>
      </div>

      <button
        onClick={() => setShowFeedbackForm(!showFeedbackForm)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
      >
        {showFeedbackForm ? "Close Feedback Form" : "Submit Feedback"}
      </button>

      {showFeedbackForm && (
        <div className="mt-4">
          <FeedbackForm eventId={eventId} />
        </div>
      )}
    </div>
  );
};

export default Events;