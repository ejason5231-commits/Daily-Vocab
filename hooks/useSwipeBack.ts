// FIX: Import React to resolve 'Cannot find namespace React' errors.
import React, { useState, useRef } from 'react';

const SWIPE_START_THRESHOLD = 50; // Pixels from the left edge to start swipe
const SWIPE_DISTANCE_THRESHOLD = 100; // Min pixels to swipe for it to be considered a "back" gesture
const MAX_VERTICAL_SWIPE = 30; // Max vertical movement to distinguish from scrolling

interface SwipeBackOptions {
  onSwipeBack: () => void;
  enabled: boolean;
}

export const useSwipeBack = ({ onSwipeBack, enabled }: SwipeBackOptions) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (!enabled || e.touches.length > 1) return;
    
    const touch = e.touches[0];
    if (touch.clientX < SWIPE_START_THRESHOLD) {
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      setIsSwiping(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (!isSwiping || !enabled || e.touches.length > 1) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartX.current;
    const diffY = Math.abs(touch.clientY - touchStartY.current);

    if (isSwiping && diffY > MAX_VERTICAL_SWIPE) {
      // More of a vertical scroll, cancel swipe
      setIsSwiping(false);
      setTranslateX(0);
      return;
    }

    if (diffX > 0) {
      // Prevent scrolling while swiping
      e.preventDefault();
      setTranslateX(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping || !enabled) return;

    if (translateX > SWIPE_DISTANCE_THRESHOLD) {
      // Animate out and trigger callback
      setTranslateX(window.innerWidth);
      setTimeout(() => {
        onSwipeBack();
        // Reset state after transition
        setTimeout(() => {
          setIsSwiping(false);
          setTranslateX(0);
        }, 50);
      }, 200);
    } else {
      // Animate back to original position
      setIsSwiping(false);
      setTranslateX(0);
    }
  };

  const swipeStyles: React.CSSProperties = {
    transform: `translateX(${translateX}px)`,
    transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
    touchAction: 'pan-y',
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    swipeStyles,
  };
};
