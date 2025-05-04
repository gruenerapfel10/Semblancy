"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DEFAULT_PLACEHOLDER } from '@/lib/changelog-data';

interface ChangelogImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function ChangelogImage({ 
  src, 
  alt, 
  className, 
  width = 1200, 
  height = 675 
}: ChangelogImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  
  // Check if the image exists
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const img = new globalThis.Image();
    img.onload = () => setImageSrc(src);
    img.onerror = () => setImageSrc(DEFAULT_PLACEHOLDER);
    img.src = src;
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto object-cover rounded-lg shadow-md border border-border"
        loading="lazy"
        onError={() => setImageSrc(DEFAULT_PLACEHOLDER)}
      />
    </div>
  );
} 