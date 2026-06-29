import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackName?: string;
}

const GRADIENTS = [
  "from-pink-500 to-rose-600 text-white",
  "from-purple-600 to-indigo-700 text-white",
  "from-blue-500 to-cyan-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-amber-500 to-orange-600 text-black",
  "from-fuchsia-600 to-pink-700 text-white",
  "from-violet-600 to-purple-800 text-white",
  "from-sky-500 to-blue-700 text-white",
  "from-red-500 to-rose-700 text-white",
  "from-indigo-500 to-purple-600 text-white",
];

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className, 
  fallbackName,
  ...props 
}) => {
  const [error, setError] = useState(false);

  // Proactively check for known broken/generic/hotlink-blocked URLs
  const isBlockedUrl = !!(src && (
    src.includes('imgur.com/79g2kMA') || 
    src.includes('imgur.com/a/') ||
    src === 'https://imgur.com/79g2kMA.png'
  ));

  if (error || !src || isBlockedUrl) {
    const name = fallbackName || alt || "TV";
    
    // Stable hash-based style selection so a channel always gets the same gradient
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    const gradientClass = GRADIENTS[index];

    // Intelligently clean and abbreviate the channel name
    const cleanName = name
      .replace(/\s*(720p|1080p|hd|sd|fhd|uhd|br|be|usa|us|in|bd|tv|live)\s*/gi, '')
      .replace(/[\[\]\(\)]/g, '')
      .trim();
    
    const words = cleanName.split(/[\s-_]+/);
    let initials = "";
    if (words.length >= 2) {
      const w1 = words[0];
      const w2 = words[1];
      if (w1 && w2) {
        initials = w1[0] + w2[0];
      } else if (w1) {
        initials = w1.substring(0, 2);
      }
    } else if (cleanName.length > 0) {
      initials = cleanName.substring(0, 2);
    } else {
      initials = "TV";
    }

    initials = initials.toUpperCase();
    initials = initials.replace(/[^A-Z0-9]/g, '');
    if (initials.length === 0) {
      initials = "TV";
    }
    if (initials.length > 3) {
      initials = initials.substring(0, 2);
    }

    return (
      <div className={cn(
        "flex flex-col items-center justify-center rounded-lg font-bold shadow-inner relative overflow-hidden select-none w-full h-full transition-all duration-300 border border-white/10",
        "bg-gradient-to-br",
        gradientClass,
        className
      )}>
        {/* Decorative background overlay */}
        <span className="absolute -bottom-1 -right-1 text-2xl font-black opacity-10 tracking-tighter uppercase select-none pointer-events-none">
          {initials}
        </span>
        
        {/* Dynamic abbreviation initials */}
        <span className="text-sm font-extrabold tracking-tight drop-shadow-md z-10">
          {initials}
        </span>
        
        {/* Left vertical visual accent bar */}
        <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-white/40 rounded-r"></div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};
