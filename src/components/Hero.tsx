import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const shape1Ref = useRef<HTMLDivElement>(null);
  const shape2Ref = useRef<HTMLDivElement>(null);
  const shape3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { width, height } = heroRef.current.getBoundingClientRect();
      
      // Calculate mouse position relative to the center of the hero section
      const x = clientX - width / 2;
      const y = clientY - height / 2;
      
      // Move shapes based on mouse position with different intensities
      if (shape1Ref.current) {
        shape1Ref.current.style.transform = `translate(${x * 0.02}px, ${y * 0.02}px)`;
      }
      
      if (shape2Ref.current) {
        shape2Ref.current.style.transform = `translate(${x * -0.03}px, ${y * -0.03}px)`;
      }
      
      if (shape3Ref.current) {
        shape3Ref.current.style.transform = `translate(${x * 0.01}px, ${y * 0.01}px)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative overflow-hidden" ref={heroRef}>
      {/* Background shapes */}
      <div 
        ref={shape1Ref}
        className="absolute top-20 left-[20%] w-64 h-64 rounded-full bg-primary/20 filter blur-3xl opacity-70 transition-transform duration-500"
      />
      <div 
        ref={shape2Ref}
        className="absolute top-40 right-[10%] w-80 h-80 rounded-full bg-accent/20 filter blur-3xl opacity-70 transition-transform duration-500"
      />
      <div 
        ref={shape3Ref}
        className="absolute bottom-20 left-[30%] w-72 h-72 rounded-full bg-primary/30 filter blur-3xl opacity-70 transition-transform duration-500"
      />

      <div className="container mx-auto px-4 py-32 md:py-40 relative z-10">
        <div className="max-w-3xl mx-auto text-center fade-in-sequence">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-8">
            Planning college events has never been easier
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Plan Epic College Events <br className="hidden md:block" />
            <span className="text-gradient">with Ease</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            An all-in-one platform for college event planning, marketing, engagement, and analytics. Perfect for student organizers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
