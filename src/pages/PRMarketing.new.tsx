import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VideoGenerator from '@/components/VideoGenerator';
import ImageGenerator from '@/components/ImageGenerator';

const PRMarketing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">PR & Marketing Dashboard</h2>
            <p className="text-muted-foreground">Generate promotional content for your events using AI</p>
          </div>
          
          {/* AI Content Generation Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">AI Content Generation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VideoGenerator />
              <ImageGenerator />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PRMarketing;
