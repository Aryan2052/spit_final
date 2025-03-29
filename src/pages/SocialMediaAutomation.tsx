import React, { useState } from "react";
import axios from "axios";

const SocialMediaAutomation = () => {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateContent = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/social-media/generate-post", {
        eventName,
        description,
        platform,
      });
      setGeneratedContent(response.data.content);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    try {
      // Replace this with actual API calls to post to social media platforms
      console.log(`Posting to ${platform}:`, generatedContent);
      alert(`Post uploaded to ${platform} successfully!`);
    } catch (error) {
      console.error(`Error posting to ${platform}:`, error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Social Media Automation</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Event Name</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter event name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter event description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Instagram">Instagram</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Twitter">Twitter</option>
          </select>
        </div>
        <button
          onClick={handleGenerateContent}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>
        {generatedContent && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Generated Content</h3>
            <p className="p-2 border rounded bg-gray-100">{generatedContent}</p>
            <button
              onClick={handlePost}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 mt-2"
            >
              Post to {platform}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaAutomation;