
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Card3DProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  delay?: number;
}

const Card3D: React.FC<Card3DProps> = ({ 
  title, 
  description, 
  icon, 
  link,
  delay = 0
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Limit rotation to a reasonable amount
    const maxRotation = 10;
    const rotateY = (x / (rect.width / 2)) * maxRotation;
    const rotateX = -(y / (rect.height / 2)) * maxRotation;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const resetRotation = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cardRef.current?.classList.add('animate-scale-in');
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  return (
    <div 
      className="opacity-0"
      style={{ animationDelay: `${delay}s` }}
      ref={cardRef}
    >
      <Link to={link}>
        <div
          className="glass-card rounded-2xl p-8 h-full card-3d-effect"
          style={{
            transform: isHovered ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : 'perspective(1000px) rotateX(0) rotateY(0)',
            transition: 'transform 0.2s ease-out, box-shadow 0.3s ease-out, transform 0.3s ease-out'
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={resetRotation}
        >
          <div className="flex flex-col space-y-4">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center text-primary">
              {icon}
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
            <div className="text-primary font-semibold mt-4 flex items-center">
              Learn more
              <svg 
                className="ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M6.66669 3.33331L10.6667 7.99998L6.66669 12.6666" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card3D;
