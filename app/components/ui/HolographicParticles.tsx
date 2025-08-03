import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface HolographicParticlesProps {
  count?: number;
  className?: string;
}

export const HolographicParticles: React.FC<HolographicParticlesProps> = ({ 
  count = 50, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const colors = [
    '#ff6b35', // W3Jverse Orange
    '#1e90ff', // W3Jverse Blue
    '#6a0dad', // W3Jverse Purple
    '#ffd700', // W3Jverse Gold
  ];

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: Math.random() * -0.5 - 0.2,
          opacity: Math.random() * 0.7 + 0.3,
        });
      }
      
      setParticles(newParticles);
    };

    generateParticles();
  }, [count]);

  useEffect(() => {
    const animateParticles = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;
          
          // Reset particle when it goes off screen
          if (newY < -5) {
            newY = 105;
            newX = Math.random() * 100;
          }
          
          if (newX < -5 || newX > 105) {
            newX = Math.random() * 100;
          }
          
          return {
            ...particle,
            x: newX,
            y: newY,
          };
        })
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`w3j-holographic-particles ${className}`}
      data-testid="w3j-holographic-particles"
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          className="w3j-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
};

export default HolographicParticles;