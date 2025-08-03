import React, { useEffect, useRef } from 'react';

interface ParticleSystemProps {
  particleCount?: number;
  className?: string;
  interactive?: boolean;
  speed?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 50,
  className = '',
  interactive = true,
  speed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  const colors = [
    'rgba(255, 107, 53, 0.6)', // W3J Primary Orange
    'rgba(30, 144, 255, 0.6)', // W3J Secondary Blue
    'rgba(255, 215, 0, 0.6)', // W3J Accent Gold
    'rgba(106, 13, 173, 0.6)', // W3J Royal Purple
    'rgba(255, 255, 255, 0.3)', // White
  ];

  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 200 + 100,
    };
  };

  const updateParticle = (particle: Particle, canvas: HTMLCanvasElement, mouse: { x: number; y: number }) => {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life++;

    // Mouse interaction
    if (interactive) {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx += (dx / distance) * force * 0.01;
        particle.vy += (dy / distance) * force * 0.01;
      }
    }

    // Boundary wrapping
    if (particle.x < 0) {
      particle.x = canvas.width;
    }

    if (particle.x > canvas.width) {
      particle.x = 0;
    }

    if (particle.y < 0) {
      particle.y = canvas.height;
    }

    if (particle.y > canvas.height) {
      particle.y = 0;
    }

    // Fade out over time
    const lifeFactor = 1 - particle.life / particle.maxLife;
    particle.opacity = lifeFactor * 0.8;

    // Reset particle when it dies
    if (particle.life >= particle.maxLife) {
      const newParticle = createParticle(canvas);
      Object.assign(particle, newParticle);
    }
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();

    // Create glow effect
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = particle.size * 2;

    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawConnections = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    ctx.save();

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const opacity = ((150 - distance) / 150) * 0.2;

          ctx.globalAlpha = opacity;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  };

  const animate = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      updateParticle(particle, canvas, mouseRef.current);
      drawParticle(ctx, particle);
    });

    // Draw connections between nearby particles
    drawConnections(ctx, particlesRef.current);

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!canvasRef.current) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = event.clientX - rect.left;
    mouseRef.current.y = event.clientY - rect.top;
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    resizeCanvas();

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle(canvas));

    // Add event listeners
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    window.addEventListener('resize', resizeCanvas);

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }

      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particleCount, interactive, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        background: 'transparent',
      }}
    />
  );
};
