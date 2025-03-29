
import React from 'react';
import Card3D from './Card3D';
import { 
  Calendar, 
  BarChart4, 
  MessageSquare, 
  Share2 
} from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      title: "Event Management",
      description: "Streamline planning with role-based dashboards for PR, Tech, Logistics, and Creatives teams.",
      icon: <Calendar size={24} />,
      link: "/event-management",
    },
    {
      title: "PR & Marketing",
      description: "AI-powered content generation, sentiment analysis, and sponsor suggestions.",
      icon: <Share2 size={24} />,
      link: "/pr-marketing",
    },
    {
      title: "Attendee Engagement",
      description: "Seamless registration, ticketing, and networking opportunities for participants.",
      icon: <MessageSquare size={24} />,
      link: "/engagement",
    },
    {
      title: "Analytics & Insights",
      description: "Real-time data visualization for attendance, engagement, and sentiment tracking.",
      icon: <BarChart4 size={24} />,
      link: "/analytics",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 fade-in-sequence">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-4">
            Key Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need in one place</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform brings together all the tools you need for successful college events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card3D
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              link={feature.link}
              delay={0.1 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
