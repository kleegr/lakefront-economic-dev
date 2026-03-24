'use client';
import { useState, useEffect, useCallback } from 'react';

// Page-specific image sets — 5 images each, all from Unsplash
const PAGE_IMAGES: Record<string, string[]> = {
  about: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&q=80',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600&q=80',
  ],
  employer: [
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600&q=80',
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1600&q=80',
  ],
  spaces: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
    'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1600&q=80',
    'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=1600&q=80',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1600&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80',
  ],
  services: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1600&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80',
  ],
  contact: [
    'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=80',
    'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=1600&q=80',
    'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1600&q=80',
    'https://images.unsplash.com/photo-1560264280-88b68371db39?w=1600&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
  ],
  jobs: [
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80',
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1600&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80',
  ],
};

interface MovingBannerProps {
  page: keyof typeof PAGE_IMAGES;
  title: string;
  subtitle?: string;
  badge?: string;
  height?: string;
}

export function MovingBanner({ page, title, subtitle, badge, height = 'h-[340px]' }: MovingBannerProps) {
  const images = PAGE_IMAGES[page] || PAGE_IMAGES.about;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const advance = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
      setNextIndex(prev => (prev + 1) % images.length);
      setIsTransitioning(false);
    }, 1000);
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance]);

  return (
    <div className={`relative ${height} overflow-hidden`}>
      {/* Current image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          opacity: isTransitioning ? 0 : 1,
        }}
      />
      {/* Next image (fades in) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${images[nextIndex]})`,
          opacity: isTransitioning ? 1 : 0,
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(30,45,31,0.75) 0%, rgba(30,45,31,0.85) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-container section-padding text-center">
          {badge && (
            <p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>{badge}</p>
          )}
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white leading-tight">{title}</h1>
          <div className="w-12 h-[2px] mx-auto mt-4 mb-4" style={{ backgroundColor: '#C9B97A' }} />
          {subtitle && (
            <p className="text-base lg:text-lg text-white/50 font-body max-w-xl mx-auto">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => { setNextIndex(i); setIsTransitioning(true); setTimeout(() => { setCurrentIndex(i); setNextIndex((i + 1) % images.length); setIsTransitioning(false); }, 1000); }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-[#C9B97A] w-6' : 'bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
