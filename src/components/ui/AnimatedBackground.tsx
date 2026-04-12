import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shapes, setShapes] = useState<FloatingShape[]>([]);

  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(newParticles);

    // Generate floating shapes
    const colors = [
      'rgba(59, 130, 246, 0.15)',
      'rgba(30, 64, 175, 0.2)',
      'rgba(96, 165, 250, 0.12)',
      'rgba(245, 158, 11, 0.1)',
    ];
    const newShapes: FloatingShape[] = [
      { id: 1, x: -5, y: 10, size: 400, color: colors[0], delay: 0 },
      { id: 2, x: 30, y: 60, size: 300, color: colors[1], delay: 5 },
      { id: 3, x: 70, y: 20, size: 350, color: colors[2], delay: 10 },
      { id: 4, x: 80, y: 70, size: 250, color: colors[3], delay: 15 },
      { id: 5, x: 50, y: 40, size: 280, color: colors[0], delay: 7 },
    ];
    setShapes(newShapes);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-royal-dark to-navy" />
      
      {/* Animated Gradient Overlay */}
      <motion.div 
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(ellipse at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating Shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            background: shape.color,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 10, -30, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 20,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Particles */}
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(0.5px)' }}>
        {particles.map((particle) => (
          <motion.circle
            key={particle.id}
            cx={`${particle.x}%`}
            cy={`${particle.y}%`}
            r={particle.size}
            fill="rgba(255, 255, 255, 0.4)"
            animate={{
              cy: [`${particle.y}%`, `${particle.y - 10}%`, `${particle.y}%`],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
        
        {/* Connection Lines */}
        {particles.slice(0, 15).map((p1, i) => 
          particles.slice(i + 1, i + 4).map((p2) => (
            <motion.line
              key={`${p1.id}-${p2.id}`}
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.15, 0] }}
              transition={{
                duration: 8,
                delay: p1.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))
        )}
      </svg>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Light Rays */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px]"
        style={{
          background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(59, 130, 246, 0.08) 60deg, transparent 120deg)',
          filter: 'blur(40px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
