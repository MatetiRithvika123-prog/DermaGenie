"use client";

import { useMemo } from "react";

interface ParticleStyle {
  left: string;
  animationDuration: string;
  animationDelay: string;
  width: string;
  height: string;
  opacity: number;
}

function generateParticles(count: number): ParticleStyle[] {
  const particles: ParticleStyle[] = [];
  for (let i = 0; i < count; i++) {
    const size = 2 + (i * 17) % 5;
    particles.push({
      left: `${(i * 37 + 13) % 100}%`,
      animationDuration: `${15 + (i * 23) % 20}s`,
      animationDelay: `${(i * 11) % 10}s`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: 0.1 + ((i * 19) % 30) / 100,
    });
  }
  return particles;
}

export default function AnimatedBackground() {
  const particles = useMemo(() => generateParticles(20), []);

  return (
    <div className="gradient-bg" aria-hidden="true">
      <div className="gradient-blob gradient-blob-1" />
      <div className="gradient-blob gradient-blob-2" />
      <div className="gradient-blob gradient-blob-3" />
      <div className="particles">
        {particles.map((style, i) => (
          <div
            key={i}
            className="particle"
            style={style}
          />
        ))}
      </div>
    </div>
  );
}
