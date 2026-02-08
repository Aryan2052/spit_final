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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail } from "lucide-react";

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
  website?: string;
  openalex_id?: string;
  citations?: number;
  works_count?: number;
  institution?: string;
  source: 'openalex';
  relevance_score?: number;
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
  // New generic email state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [currentEmailTaskType, setCurrentEmailTaskType] = useState<'PR' | 'Tech' | 'Logistics' | 'Creatives' | ''>('');

  const eventTheme = watch("eventTheme");
  const budget = watch("budget");
  const location = watch("location");
  const eventName = watch("eventName");
  const prTasks = watch("prTasks");

  // Watch other tasks
  const techTasks = watch("techTasks");
  const logisticsTasks = watch("logisticsTasks");
  const creativesTasks = watch("creativesTasks");

  const openEmailDialog = (type: 'PR' | 'Tech' | 'Logistics' | 'Creatives') => {
    setCurrentEmailTaskType(type);
    setEmailRecipients('');
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = () => {
    if (!emailRecipients || !currentEmailTaskType) return;

    let taskContent = '';
    switch (currentEmailTaskType) {
      case 'PR': taskContent = prTasks; break;
      case 'Tech': taskContent = techTasks; break;
      case 'Logistics': taskContent = logisticsTasks; break;
      case 'Creatives': taskContent = creativesTasks; break;
    }

    const subject = encodeURIComponent(`${currentEmailTaskType} Tasks for ${eventName}`);
    const body = encodeURIComponent(`Here are the ${currentEmailTaskType} tasks for ${eventName}:\n\n${taskContent}`);

    // Open default email client
    window.location.href = `mailto:${emailRecipients}?subject=${subject}&body=${body}`;

    setIsEmailDialogOpen(false);
    setEmailRecipients('');
  };

  useEffect(() => {
    if (selectedEvent) {
      setValue("eventName", selectedEvent.name);
      setValue("location", selectedEvent.location);
    }
  }, [selectedEvent, setValue]);



  // Parse location: "SPIT, Mumbai, India" or "Mumbai, India"
  const parseLocation = (locationString: string): { institution?: string, city?: string, country?: string } => {
    const parts = locationString.split(',').map(s => s.trim());
    if (parts.length === 3) return { institution: parts[0], city: parts[1], country: parts[2] };
    if (parts.length === 2) return { city: parts[0], country: parts[1] };
    if (parts.length === 1) return { city: parts[0] };
    return {};
  };

  const findCityInstitutions = async (city: string): Promise<string[]> => {
    try {
      const url = `https://api.openalex.org/institutions?search=${encodeURIComponent(city)}&filter=country_code:IN&per-page=100`;
      console.log(`🏛️ Finding institutions in ${city}...`);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const institutionIds = data.results.map((inst: any) => inst.id);
        console.log(`✅ Found ${institutionIds.length} institutions in ${city}`);
        return institutionIds;
      }
      console.log(`⚠️ No institutions found for ${city}`);
      return [];
    } catch (error) {
      console.error('Error finding institutions:', error);
      return [];
    }
  };

  const isRelevantExpert = (concepts: any[], theme: string): boolean => {
    if (!concepts || concepts.length === 0) {
      console.log(`   ⚠️ No concepts available`);
      return true; // Include if no concepts (benefit of doubt)
    }

    const themeLower = theme.toLowerCase();
    const topConcepts = concepts.slice(0, 20).map((c: any) => c.display_name.toLowerCase());

    // Tech-related keywords (very broad)
    const techKeywords = [
      'computer', 'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'data science', 'software', 'algorithm', 'programming',
      'data mining', 'natural language processing', 'computer vision', 'robotics',
      'information technology', 'computational', 'database', 'distributed computing',
      'cloud computing', 'internet', 'web', 'networking', 'cybersecurity',
      'blockchain', 'internet of things', 'embedded system', 'human-computer interaction',
      'pattern recognition', 'optimization', 'automation', 'information system',
      'digital', 'analytics', 'engineering', 'science'
    ];

    // Check if has ANY tech keyword
    const hasTechConcept = topConcepts.some(concept =>
      techKeywords.some(keyword => concept.includes(keyword))
    );

    if (hasTechConcept) {
      console.log(`   ✓ Has tech concepts`);
      return true;
    }

    // For AI/ML themes, be even more lenient
    if (themeLower.includes('ai') || themeLower.includes('ml') || themeLower.includes('machine learning')) {
      // Accept anyone with math, statistics, engineering
      const broadKeywords = ['mathematics', 'statistics', 'engineering', 'science', 'technology'];
      const hasBroadMatch = topConcepts.some(concept =>
        broadKeywords.some(keyword => concept.includes(keyword))
      );
      if (hasBroadMatch) {
        console.log(`   ✓ Has broad STEM background`);
        return true;
      }
    }

    console.log(`   ⚠️ No relevant concepts found`);
    return false;
  };

  const searchCityExperts = async (
    theme: string,
    city: string,
    institutionIds: string[]
  ): Promise<SpeakerJudgeData[]> => {
    const results: SpeakerJudgeData[] = [];
    const seenIds = new Set<string>();

    const themeLower = theme.toLowerCase();
    let searchQueries: string[] = [];

    // SIMPLIFIED queries
    if (themeLower.includes('ai') || themeLower.includes('artificial intelligence')) {
      searchQueries = ['artificial intelligence', 'machine learning', 'computer science'];
    } else if (themeLower.includes('ml') || themeLower.includes('machine learning')) {
      searchQueries = ['machine learning', 'computer science'];
    } else if (themeLower.includes('blockchain')) {
      searchQueries = ['blockchain', 'computer science'];
    } else if (themeLower.includes('web')) {
      searchQueries = ['computer science', 'software'];
    } else if (themeLower.includes('data')) {
      searchQueries = ['data science', 'computer science'];
    } else {
      searchQueries = ['computer science'];
    }

    console.log(`\n🔍 Searching ALL of India for ${theme}, then filtering for ${city}`);
    console.log(`📋 Will try ${searchQueries.length} queries`);

    for (const query of searchQueries) {
      if (results.length >= 50) {
        console.log(`✅ Reached 50 results, stopping`);
        break;
      }

      try {
        // SIMPLE SEARCH: Just search theme in India, NO city filter in query
        const url = `https://api.openalex.org/authors?search=${encodeURIComponent(query)}&filter=last_known_institutions.country_code:IN&per-page=200&sort=cited_by_count:desc`;

        console.log(`\n🔍 Searching India for: "${query}"`);

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          console.error(`   ❌ API Error:`, data.error);
          continue;
        }

        if (!data.results || data.results.length === 0) {
          console.log(`   ⚠️ No results from OpenAlex`);
          continue;
        }

        console.log(`   ✓ Got ${data.results.length} total results from India`);

        let cityMatches = 0;
        let addedFromQuery = 0;

        for (const author of data.results) {
          if (seenIds.has(author.id)) continue;

          const authorInst = author.last_known_institutions?.[0];
          const authorCity = authorInst?.city || '';
          const affiliation = authorInst?.display_name || 'Unknown Institution';

          // Check if from target city (CASE INSENSITIVE, PARTIAL MATCH)
          const cityLower = city.toLowerCase();
          const authorCityLower = authorCity.toLowerCase();
          const isFromCity = authorCityLower.includes(cityLower) || cityLower.includes(authorCityLower);

          if (!isFromCity) {
            continue; // Skip if not from target city
          }

          cityMatches++;

          const concepts = author.x_concepts || [];

          // VERY LENIENT relevance check
          if (!isRelevantExpert(concepts, theme)) {
            continue;
          }

          seenIds.add(author.id);

          const citations = author.cited_by_count || 0;
          const works = author.works_count || 0;

          // Get tech concepts
          const techKeywords = [
            'computer', 'artificial intelligence', 'machine learning', 'deep learning',
            'neural network', 'data science', 'software', 'algorithm', 'programming',
            'data mining', 'natural language processing', 'computer vision', 'robotics',
            'information technology', 'computational', 'database', 'distributed computing',
            'cloud computing', 'internet', 'web', 'networking', 'cybersecurity',
            'blockchain', 'internet of things', 'embedded system'
          ];

          const techConcepts = concepts
            .filter((c: any) =>
              techKeywords.some(keyword => c.display_name.toLowerCase().includes(keyword))
            )
            .slice(0, 5)
            .map((c: any) => c.display_name);

          const expertise = techConcepts.length > 0
            ? techConcepts.join(', ')
            : concepts.slice(0, 3).map((c: any) => c.display_name).join(', ');

          let relevanceScore = 100;
          const topConcepts = concepts.slice(0, 10).map((c: any) => c.display_name.toLowerCase());

          // Theme boosts
          if (themeLower.includes('ai') && topConcepts.some(c => c.includes('artificial intelligence') || c.includes('machine learning'))) {
            relevanceScore += 300;
          } else if (themeLower.includes('ml') && topConcepts.some(c => c.includes('machine learning'))) {
            relevanceScore += 300;
          } else if (themeLower.includes('blockchain') && topConcepts.some(c => c.includes('blockchain'))) {
            relevanceScore += 300;
          } else if (themeLower.includes('data') && topConcepts.some(c => c.includes('data'))) {
            relevanceScore += 200;
          }

          relevanceScore += Math.log10(citations + 1) * 10 + works;

          console.log(`   ✓ ${author.display_name} from ${affiliation}, ${authorCity}`);

          results.push({
            name: author.display_name,
            expertise: expertise,
            fee: 'Contact for pricing',
            availability: 'Contact for availability',
            location: `${affiliation}, ${authorCity}, India`,
            institution: affiliation,
            openalex_id: author.id,
            citations: citations,
            works_count: works,
            website: author.orcid ? `https://orcid.org/${author.orcid.replace('https://orcid.org/', '')}` : undefined,
            source: 'openalex',
            relevance_score: relevanceScore
          });

          addedFromQuery++;

          if (addedFromQuery >= 50) break;
        }

        console.log(`   📍 Found ${cityMatches} from ${city}, added ${addedFromQuery} after filters`);

      } catch (error) {
        console.error(`   ❌ Error:`, error);
      }
    }

    console.log(`\n✅ TOTAL: ${results.length} experts from ${city}`);
    return results;
  };

  const fetchRecommendations = async () => {
    if (!eventTheme || !budget || !location) {
      setRecommendationError('Please fill in Event Theme, Budget, and Location first');
      return;
    }

    setIsLoadingRecommendations(true);
    setRecommendationError(null);
    setSpeakerResults([]);
    setJudgeResults([]);

    try {
      const { city } = parseLocation(location);

      if (!city) {
        setRecommendationError('Please specify a city in the location field (e.g., Mumbai, India)');
        setIsLoadingRecommendations(false);
        return;
      }

      console.log(`\n🚀 Searching for ${eventTheme} experts in ${city}...`);

      // Find institutions in the city
      const institutionIds = await findCityInstitutions(city);

      if (institutionIds.length === 0) {
        setRecommendationError(`No institutions found in ${city}. Try a different city or broader location.`);
        setIsLoadingRecommendations(false);
        return;
      }

      // Search for experts in those institutions
      const cityExperts = await searchCityExperts(eventTheme, city, institutionIds);

      if (cityExperts.length === 0) {
        setRecommendationError(
          `No ${eventTheme} experts found in ${city}. Try:\n` +
          `• Broader terms (e.g., "AI" instead of "Artificial Intelligence")\n` +
          `• Different city nearby\n` +
          `• More general theme keywords`
        );
        setIsLoadingRecommendations(false);
        return;
      }

      // Remove duplicates
      const uniqueExperts = Array.from(
        new Map(cityExperts.map(item => [item.openalex_id, item])).values()
      );

      // Sort by relevance score
      const sorted = uniqueExperts.sort((a, b) =>
        (b.relevance_score || 0) - (a.relevance_score || 0)
      );

      console.log(`\n📊 Final results: ${sorted.length} experts`);
      console.log('\n🏆 Top results:');
      sorted.slice(0, 10).forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} - ${r.institution}`);
        console.log(`   Expertise: ${r.expertise}`);
        console.log(`   Publications: ${r.works_count}, Citations: ${r.citations}`);
      });

      // Split into speakers and judges
      const speakers = sorted.slice(0, 10);
      const judges = sorted.slice(10, 20);

      setSpeakerResults(speakers);
      setJudgeResults(judges);

    } catch (error) {
      console.error('Error:', error);
      setRecommendationError('An error occurred. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const RecommendationCard = ({ person }: { person: SpeakerJudgeData }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-2xl hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1">
      <div className="mb-3">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{person.name}</h3>
        {person.institution && (
          <p className="text-sm text-gray-600 mb-2 flex items-start gap-1">
            <span className="text-blue-600">📍</span>
            <span className="flex-1">{person.institution}</span>
          </p>
        )}
      </div>

      <div className="space-y-2.5 text-sm mb-4">
        <div className="bg-blue-50 p-2.5 rounded-lg">
          <p className="text-gray-700">
            <strong className="text-blue-900">Expertise:</strong>
            <span className="block mt-1 text-blue-800">{person.expertise}</span>
          </p>
        </div>

        {(person.citations || person.works_count) && (
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            {person.citations !== undefined && person.citations > 0 && (
              <div className="bg-purple-50 px-3 py-1.5 rounded-full">
                <strong className="text-purple-800">Citations:</strong>
                <span className="text-purple-900 font-semibold ml-1">{person.citations.toLocaleString()}</span>
              </div>
            )}
            {person.works_count !== undefined && person.works_count > 0 && (
              <div className="bg-green-50 px-3 py-1.5 rounded-full">
                <strong className="text-green-800">Publications:</strong>
                <span className="text-green-900 font-semibold ml-1">{person.works_count}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-200">
        {person.openalex_id && (
          <a
            href={person.openalex_id}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <span>View Academic Profile</span>
            <span className="text-lg">→</span>
          </a>
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-12 space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Select Existing Event (Optional)</label>
        <Select onValueChange={onEventSelect} value={selectedEvent?._id || "none"}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an event or create new" />
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
            <p className="text-sm"><strong>Description:</strong> {selectedEvent.description}</p>
            <p className="text-sm"><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p className="text-sm"><strong>Location:</strong> {selectedEvent.location}</p>
            <p className="text-sm"><strong>Organizer:</strong> {selectedEvent.organizer}</p>
            <p className="text-sm"><strong>Category:</strong> {selectedEvent.category || 'Not specified'}</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
        <input
          type="text"
          {...register("eventName", { required: "Event name is required" })}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter event name"
          readOnly={!!selectedEvent}
        />
        {errors.eventName && <p className="text-red-500 text-sm mt-1">{errors.eventName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Theme *</label>
        <input
          type="text"
          {...register("eventTheme", { required: "Event theme is required" })}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., AI, Machine Learning, Web Development, Blockchain"
        />
        <p className="text-xs text-gray-500 mt-1">💡 Use keywords like AI, ML, Blockchain, Web Development</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Budget (INR) *</label>
        <input
          type="text"
          {...register("budget", { required: "Budget is required" })}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 50000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
        <input
          type="text"
          {...register("location", { required: "Location is required" })}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., VESIT, Mumbai, India or Mumbai, India"
          defaultValue={selectedEvent?.location}
        />
        <p className="text-xs text-gray-500 mt-1">📍 City is required to find local experts</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">PR Tasks</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openEmailDialog('PR')}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 px-2"
          >
            <Mail className="w-4 h-4 mr-1.5" />
            Send to PR Team
          </Button>
        </div>
        <textarea
          {...register("prTasks")}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
          placeholder="e.g., Write press release, Contact media"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">Tech Tasks</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openEmailDialog('Tech')}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 px-2"
          >
            <Mail className="w-4 h-4 mr-1.5" />
            Send to Tech Team
          </Button>
        </div>
        <textarea
          {...register("techTasks")}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
          placeholder="e.g., Setup sound system, Test AV equipment"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">Logistics Tasks</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openEmailDialog('Logistics')}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 px-2"
          >
            <Mail className="w-4 h-4 mr-1.5" />
            Send to Logistics Team
          </Button>
        </div>
        <textarea
          {...register("logisticsTasks")}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
          placeholder="e.g., Book venue, Arrange catering"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">Creatives Tasks</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openEmailDialog('Creatives')}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 px-2"
          >
            <Mail className="w-4 h-4 mr-1.5" />
            Send to Creatives Team
          </Button>
        </div>
        <textarea
          {...register("creativesTasks")}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
          placeholder="e.g., Design posters, Create social media content"
        />
      </div>

      {/* Expert Recommendations */}
      <div className="space-y-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-blue-300 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎓</span>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-blue-900">City-Based Expert Finder</h3>
            <p className="text-sm text-gray-600 mt-1">Find experts from your city - all experience levels included</p>
          </div>
        </div>

        {recommendationError && (
          <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-800 px-4 py-3 rounded-lg shadow-sm">
            <p className="text-sm font-medium flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span className="whitespace-pre-line">{recommendationError}</span>
            </p>
          </div>
        )}

        <Button
          type="button"
          onClick={fetchRecommendations}
          disabled={isLoadingRecommendations || !eventTheme || !budget || !location}
          className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingRecommendations ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🔍</span>
              <span>Finding local experts...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🎓</span>
              <span>Find Local Experts</span>
            </span>
          )}
        </Button>

        {speakerResults.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
              <span className="text-2xl">🎤</span>
              <span>Speaker Recommendations</span>
              <span className="ml-2 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                {speakerResults.length}
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {speakerResults.map((person, index) => (
                <RecommendationCard key={`speaker-${index}`} person={person} />
              ))}
            </div>
          </div>
        )}

        {judgeResults.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
              <span className="text-2xl">⚖️</span>
              <span>Judge Recommendations</span>
              <span className="ml-2 bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                {judgeResults.length}
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {judgeResults.map((person, index) => (
                <RecommendationCard key={`judge-${index}`} person={person} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚙️</span>
            <span>Generating Tasks...</span>
          </span>
        ) : (
          <span>Generate Tasks</span>
        )}
      </Button>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send {currentEmailTaskType} Tasks</DialogTitle>
            <DialogDescription>
              Enter the email addresses (comma separated) for the {currentEmailTaskType} team. This will open your default email client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                To:
              </label>
              <input
                id="email"
                type="text"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                className="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSendEmail} disabled={!emailRecipients}>
              <Mail className="w-4 h-4 mr-2" /> Open Email Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default EventManagementForm;