import React, { useState } from "react";
import axios from "axios";

interface FeedbackFormProps {
  eventId: string;
  onClose?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ eventId, onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [eventExperience, setEventExperience] = useState<number>(0);
  const [speakerInteraction, setSpeakerInteraction] = useState<number>(0);
  const [sessionRelevance, setSessionRelevance] = useState<number>(0);
  const [suggestions, setSuggestions] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post("http://localhost:5000/api/feedback", {
        eventId,
        rating,
        eventExperience,
        speakerInteraction,
        sessionRelevance,
        suggestions,
      });

      if (response.status === 201) {
        setSuccessMessage("Feedback submitted successfully!");
        setRating(5);
        setEventExperience(5);
        setSpeakerInteraction(5);
        setSessionRelevance(5);
        setSuggestions("");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number, setter: React.Dispatch<React.SetStateAction<number>>) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            onClick={() => setter(star)}
            xmlns="http://www.w3.org/2000/svg"
            className={`w-6 h-6 cursor-pointer ${
              star <= value ? "text-yellow-500" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.869 1.4-8.168L.132 9.21l8.2-1.192z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Feedback</h1>
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Overall Rating</label>
          {renderStars(rating, setRating)}
        </div>
        <div>
          <label className="block text-sm font-medium">Event Experience</label>
          {renderStars(eventExperience, setEventExperience)}
        </div>
        <div>
          <label className="block text-sm font-medium">Speaker Interaction</label>
          {renderStars(speakerInteraction, setSpeakerInteraction)}
        </div>
        <div>
          <label className="block text-sm font-medium">Session Relevance</label>
          {renderStars(sessionRelevance, setSessionRelevance)}
        </div>
        <div>
          <label className="block text-sm font-medium">Suggestions</label>
          <textarea
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Any suggestions for improvement?"
          />
        </div>
        <div className="flex justify-end gap-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;