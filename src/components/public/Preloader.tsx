'use client';

import { useState, useEffect } from 'react';

export function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="preloader">
      <div className="flex flex-col items-center">
        <span
          className="mb-6"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '36px',
            fontWeight: 400,
            color: '#2C3E2D',
            letterSpacing: '-0.5px',
            opacity: 0,
            animation: 'fadeIn 0.6s ease-out 0.3s forwards',
          }}
        >
          Lakefront
        </span>
        <div className="flex gap-2">
          <div className="preloader-dot" />
          <div className="preloader-dot" />
          <div className="preloader-dot" />
        </div>
      </div>
    </div>
  );
}
