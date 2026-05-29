import React from 'react';
import { motion } from 'motion/react';

interface CoolAvatarProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export default function CoolAvatar({ className = '', size = 80, animate = true }: CoolAvatarProps) {
  return (
    <motion.div
      className={`relative inline-block select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      {...(animate ? {
        animate: { y: [0, -4, 0] },
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      } : {})}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* HAIR - Brutalist spiky cool haircut */}
        <path
          d="M20,40 Q15,25 35,18 Q45,15 55,16 Q75,12 80,28 Q88,25 82,42 Q85,48 80,55 L82,60 L22,60 Q18,52 20,40 Z"
          fill="#1A1A1A"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* FACE */}
        <path
          d="M25,50 Q25,82 50,82 Q75,82 75,50 L75,65 Q75,82 50,82 Q25,82 25,65 Z"
          fill="#F5E0D3"
        />
        <path
          d="M25,55 C25,75 35,80 50,80 C65,80 75,75 75,55 L75,60 C75,76 65,82 50,82 C35,82 25,76 25,60 Z"
          fill="#FFF"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* EARS */}
        <circle cx="23" cy="58" r="7" fill="#F5E0D3" stroke="#000000" strokeWidth="3" />
        <circle cx="77" cy="58" r="7" fill="#F5E0D3" stroke="#000000" strokeWidth="3" />

        {/* COOL SUNGLASSES - The defining style of the avatar */}
        <g id="sunglasses">
          {/* Bridge */}
          <rect x="42" y="47" width="16" height="4" fill="#000" />
          
          {/* Left Lens */}
          <path
            d="M22,42 H49 C49,42 47,56 36,56 C25,56 22,42 22,42 Z"
            fill="#050505"
            stroke="#000"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Right Lens */}
          <path
            d="M51,42 H78 C78,42 76,56 65,56 C54,56 51,42 51,42 Z"
            fill="#050505"
            stroke="#000"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Reflections/Glint */}
          <polygon points="26,45 32,45 28,52 26,52" fill="#FFF" opacity="0.8" />
          <polygon points="56,45 62,45 58,52 56,52" fill="#FFF" opacity="0.8" />
        </g>

        {/* SMILE / smirk */}
        <path
          d="M44,68 Q50,71 56,68"
          stroke="#000"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* CHEEKS blush */}
        <circle cx="30" cy="62" r="3" fill="#FF0000" opacity="0.5" />
        <circle cx="70" cy="62" r="3" fill="#FF0000" opacity="0.5" />
      </svg>
    </motion.div>
  );
}
