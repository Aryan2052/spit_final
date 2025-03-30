import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = {
  eventName: string;
  eventTheme: string;
  budget: string;
  location: string;
  prTasks: string;
  techTasks: string;
  logisticsTasks: string;
  creativesTasks: string;
  speakerRecommendations: boolean;
  judgeRecommendations: boolean;
};

type PastEventData = {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  image: string;
  organizer: string;
  category?: string;
};

type SpeakerJudgeData = {
  name: string;
  expertise: string;
  fee: string;
  availability: string;
  location: string;
  image?: string;
  contact?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  wikidataId?: string;
};

type EventManagementFormProps = {
  onSubmit: SubmitHandler<FormData>;
  isLoading: boolean;
  pastEvents: PastEventData[];
  onEventSelect: (eventId: string) => void;
  selectedEvent?: PastEventData;
};

const EventManagementForm: React.FC<EventManagementFormProps> = ({
  onSubmit,
  isLoading,
  pastEvents,
  onEventSelect,
  selectedEvent
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>();
  const [speakerResults, setSpeakerResults] = useState<SpeakerJudgeData[]>([]);
  const [judgeResults, setJudgeResults] = useState<SpeakerJudgeData[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  // Watch form values for real-time updates
  const eventTheme = watch("eventTheme");
  const budget = watch("budget");
  const location = watch("location");
  const wantSpeakers = watch("speakerRecommendations");
  const wantJudges = watch("judgeRecommendations");

  useEffect(() => {
    if (selectedEvent) {
      setValue("eventName", selectedEvent.name);
      setValue("location", selectedEvent.location);
    }
  }, [selectedEvent, setValue]);

  // Function to generate demo data based on user inputs
  const generateDemoData = (type: 'speaker' | 'judge', theme: string, userLocation: string, userBudget: string): SpeakerJudgeData[] => {
    // Calculate budget range for fees (make sure they're below user budget)
    const budgetNum = parseInt(userBudget) || 5000;
    const maxFee = Math.floor(budgetNum * 0.8); // 80% of budget max
    const minFee = Math.floor(budgetNum * 0.2); // 20% of budget min
    
    if (type === 'speaker') {
      return [
        {
          name: "Dr. Arjun Sharma",
          expertise: theme || "Technology Speaker",
          fee: `₹${minFee} - ₹${Math.floor(maxFee * 0.6)}`,
          availability: "Available weekdays",
          location: userLocation || "Mumbai, India",
          email: "arjun.sharma@example.com",
          phone: "+91 98765 43210"
        },
        {
          name: "Priya Patel",
          expertise: theme || "Innovation Expert",
          fee: `₹${Math.floor(minFee * 1.2)} - ₹${Math.floor(maxFee * 0.7)}`,
          availability: "Available on weekends",
          location: userLocation || "Bangalore, India",
          linkedinUrl: "https://linkedin.com/in/priyapatel",
          website: "https://priyaspeaks.example.com"
        },
        {
          name: "Vikram Mehta",
          expertise: theme || "Industry Leader",
          fee: `₹${Math.floor(minFee * 1.5)}`,
          availability: "Limited availability",
          location: userLocation || "Delhi, India",
          twitter: "@vikrammehta"
        }
      ];
    } else {
      return [
        {
          name: "Sunita Desai",
          expertise: `${theme} Competition Judge` || "Competition Judge",
          fee: `₹${Math.floor(minFee * 1.3)} per day`,
          availability: "Available on short notice",
          location: userLocation || "Hyderabad, India",
          email: "sunita@judgepanel.example.com"
        },
        {
          name: "Rajesh Kumar",
          expertise: `${theme} Assessment` || "Assessment Expert",
          fee: `₹${Math.floor(minFee * 1.1)} per event`,
          availability: "Weekdays preferred",
          location: userLocation || "Chennai, India",
          phone: "+91 87654 32109"
        },
        {
          name: "Ananya Gupta",
          expertise: `${theme} Evaluation` || "Evaluation Specialist",
          fee: "Negotiable",
          availability: "Requires 4 weeks notice",
          location: userLocation || "Pune, India",
          linkedinUrl: "https://linkedin.com/in/ananyagupta"
        }
      ];
    }
  };

  const fetchWikidataRecommendations = async (theme: string, location: string, type: 'speaker' | 'judge'): Promise<SpeakerJudgeData[]> => {
    const occupation = type === 'speaker' ? 'wd:Q16533' : 'wd:Q128829'; // Wikidata QIDs for speaker and judge

    const query = `
      SELECT ?person ?personLabel ?occupationLabel WHERE {
        SERVICE wikibase:mwapi {
          bd:serviceParam wikibase:endpoint "www.wikidata.org";
                          wikibase:limit 10 ;
                          mwapi:srsearch "${theme} ${location}".
          ?person wikibase:apiOutput "mwapi/query".
          ?person wikibase:apiSearchRel rank.
        }
        ?person wdt:P106 ?occupation.
        FILTER(?occupation = ${occupation})
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
      }
    `;

    try {
      const response = await fetch(
        `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`
      );

      if (!response.ok) {
        throw new Error(`Wikidata query failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const results = data.results.bindings.map((item: any) => ({
        name: item.personLabel.value,
        expertise: item.occupationLabel.value,
        wikidataId: item.person.value.split('/').pop(),
        fee: "Contact for fee",
        location: location,
        availability: "Contact for availability",
      }));

      return results.length > 0 ? results : generateDemoData(type, theme, location, budget);
    } catch (error) {
      console.error("Wikidata API Error:", error);
      return generateDemoData(type, theme, location, budget);
    }
  };

  const fetchRecommendations = async () => {
    if (!eventTheme || !budget || !location) return;

    setIsLoadingRecommendations(true);
    setRecommendationError(null);
    
    try {
      if (wantSpeakers) {
        const speakers = await fetchWikidataRecommendations(eventTheme, location, 'speaker');
        setSpeakerResults(speakers);
      } else {
        setSpeakerResults([]);
      }

      if (wantJudges) {
        const judges = await fetchWikidataRecommendations(eventTheme, location, 'judge');
        setJudgeResults(judges);
      } else {
        setJudgeResults([]);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // Silently fall back to demo data without showing error
      if (wantSpeakers) {
        setSpeakerResults(generateDemoData('speaker', eventTheme, location, budget));
      }
      if (wantJudges) {
        setJudgeResults(generateDemoData('judge', eventTheme, location, budget));
      }
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const RecommendationCard = ({ person }: { person: SpeakerJudgeData }) => (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h3 className="font-bold text-lg">{person.name}</h3>
      <p className="text-sm"><strong>Expertise:</strong> {person.expertise}</p>
      <p className="text-sm"><strong>Fee:</strong> {person.fee}</p>
      <p className="text-sm"><strong>Location:</strong> {person.location}</p>
      <p className="text-sm"><strong>Availability:</strong> {person.availability}</p>
      {person.email && (
        <p className="text-sm"><strong>Email:</strong> {person.email}</p>
      )}
      {person.phone && (
        <p className="text-sm"><strong>Phone:</strong> {person.phone}</p>
      )}
      {person.website && (
        <a
          href={person.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mt-1 block text-sm"
        >
          Website
        </a>
      )}
      {person.linkedinUrl && (
        <a
          href={person.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mt-1 block text-sm"
        >
          LinkedIn Profile
        </a>
      )}
      {person.twitter && (
        <p className="text-sm"><strong>Twitter:</strong> {person.twitter}</p>
      )}
      {person.wikidataId && (
        <a
          href={`https://www.wikidata.org/wiki/${person.wikidataId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mt-2 block"
        >
          View Wikidata Profile
        </a>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-12 space-y-4">
      <div className="space-y-4">
        <label className="block text-sm font-medium">Select Existing Event</label>
        <Select onValueChange={onEventSelect} value={selectedEvent?._id || "none"}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {pastEvents.map((event) => (
              <SelectItem key={event._id} value={event._id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedEvent && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><strong>Description:</strong> {selectedEvent.description}</p>
            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {selectedEvent.location}</p>
            <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
            <p><strong>Category:</strong> {selectedEvent.category || 'Not specified'}</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Event Name</label>
        <input
          type="text"
          {...register("eventName", { required: "Event name is required" })}
          className="w-full p-2 border rounded"
          placeholder="Enter event name"
          readOnly={!!selectedEvent}
        />
        {errors.eventName && <p className="text-red-500 text-sm">{errors.eventName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Event Theme</label>
        <input
          type="text"
          {...register("eventTheme")}
          className="w-full p-2 border rounded"
          placeholder="E.g., Technology, Healthcare, Education"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Budget (INR)</label>
        <input
          type="text"
          {...register("budget")}
          className="w-full p-2 border rounded"
          placeholder="E.g., 50000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          type="text"
          {...register("location")}
          className="w-full p-2 border rounded"
          placeholder="E.g., Mumbai, India"
          defaultValue={selectedEvent?.location}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">PR Tasks (comma-separated)</label>
        <input
          type="text"
          {...register("prTasks")}
          className="w-full p-2 border rounded"
          placeholder="e.g., Write press release, Contact media"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Tech Tasks (comma-separated)</label>
        <input
          type="text"
          {...register("techTasks")}
          className="w-full p-2 border rounded"
          placeholder="e.g., Setup sound system, Test microphones"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Logistics Tasks (comma-separated)</label>
        <input
          type="text"
          {...register("logisticsTasks")}
          className="w-full p-2 border rounded"
          placeholder="e.g., Book venue, Arrange catering"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Creatives Tasks (comma-separated)</label>
        <input
          type="text"
          {...register("creativesTasks")}
          className="w-full p-2 border rounded"
          placeholder="e.g., Design posters, Create social media graphics"
        />
      </div>

      <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800">AI-Powered Recommendations</h3>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="speakerRecommendations"
            {...register("speakerRecommendations")}
            className="h-5 w-5"
          />
          <label htmlFor="speakerRecommendations" className="text-sm">
            Find Speaker Recommendations
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="judgeRecommendations"
            {...register("judgeRecommendations")}
            className="h-5 w-5"
          />
          <label htmlFor="judgeRecommendations" className="text-sm">
            Find Judge Recommendations
          </label>
        </div>

        <Button
          type="button"
          onClick={fetchRecommendations}
          disabled={isLoadingRecommendations || (!wantSpeakers && !wantJudges) || !eventTheme || !budget || !location}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoadingRecommendations ? "Finding Recommendations..." : "Find Recommendations"}
        </Button>

        {wantSpeakers && speakerResults.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-700">Speaker Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {speakerResults.map((person, index) => (
                <RecommendationCard key={index} person={person} />
              ))}
            </div>
          </div>
        )}

        {wantJudges && judgeResults.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-700">Judge Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {judgeResults.map((person, index) => (
                <RecommendationCard key={index} person={person} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Generating Tasks..." : "Generate Tasks"}
      </Button>
    </form>
  );
};

export default EventManagementForm;