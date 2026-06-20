import React, { useState } from 'react';
import { Tv } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className, 
  fallbackName,
  ...props 
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-white/5 rounded-lg border border-white/10 w-full h-full", className)}>
         <Tv className="w-1/2 h-1/2 text-sflive-muted opacity-50 mb-1" />
         {fallbackName && <span className="text-[10px] font-bold text-center text-sflive-muted px-1 truncate w-full">{fallbackName}</span>}
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
