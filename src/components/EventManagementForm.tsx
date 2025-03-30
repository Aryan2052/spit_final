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
  prTasks: string;
  techTasks: string;
  logisticsTasks: string;
  creativesTasks: string;
  category: string;
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
  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm<FormData>();

  useEffect(() => {
    if (selectedEvent) {
      setValue("eventName", selectedEvent.name);
      if (selectedEvent.category) {
        setValue("category", selectedEvent.category);
      }
    }
  }, [selectedEvent, setValue]);

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
        <label className="block text-sm font-medium">Event Category</label>
        <Select 
          onValueChange={(value) => setValue("category", value)} 
          defaultValue={selectedEvent?.category || "tech"}
        >
          <SelectTrigger className="w-full p-2 border rounded">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
            <SelectItem value="cultural">Cultural</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register("category", { required: "Category is required" })} />
        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Generating Tasks..." : "Generate Tasks"}
      </Button>
    </form>
  );
};

export default EventManagementForm;