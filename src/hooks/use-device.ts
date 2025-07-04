import { useState, useEffect, useMemo, useCallback } from 'react';
import { APP_CONFIG } from "@/lib/constants";

// Optimized mobile detection with reduced re-renders
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < APP_CONFIG.MOBILE_BREAKPOINT : false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Optimize with memoized value comparison
    const checkMobile = () => {
      const width = window.innerWidth;
      const currentValue = width < APP_CONFIG.MOBILE_BREAKPOINT;
      if (currentValue !== isMobile) {
        setIsMobile(currentValue);
      }
    };
    
    // Debounce the resize check for performance
    const debouncedCheck = debounce(checkMobile, 100);
    
    window.addEventListener("resize", debouncedCheck);
    
    return () => window.removeEventListener("resize", debouncedCheck);
  }, [isMobile]);

  return isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= APP_CONFIG.MOBILE_BREAKPOINT && width < APP_CONFIG.DESKTOP_BREAKPOINT;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkTablet = debounce(() => {
      const width = window.innerWidth;
      const currentValue = width >= APP_CONFIG.MOBILE_BREAKPOINT && width < APP_CONFIG.DESKTOP_BREAKPOINT;
      if (currentValue !== isTablet) {
        setIsTablet(currentValue);
      }
    }, 100);

    window.addEventListener("resize", checkTablet);
    
    return () => window.removeEventListener("resize", checkTablet);
  }, [isTablet]);

  return isTablet;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth >= APP_CONFIG.DESKTOP_BREAKPOINT : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkDesktop = () => {
      const width = window.innerWidth;
      const currentValue = width >= APP_CONFIG.DESKTOP_BREAKPOINT;
      if (currentValue !== isDesktop) {
        setIsDesktop(currentValue);
      }
    };
    
    const debouncedResize = debounce(checkDesktop, 250);
    window.addEventListener("resize", debouncedResize);
    
    return () => window.removeEventListener("resize", debouncedResize);
  }, [isDesktop]);

  return isDesktop;
}

export function useViewportSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const handleResize = useCallback(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener("resize", debouncedResize);
    
    return () => window.removeEventListener("resize", debouncedResize);
  }, [handleResize]);

  return size;
}

// Add debounce function to prevent excessive resize events
function debounce(func: Function, wait: number): (...args: any[]) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Returns the current device and orientation
export function useDevice() {
  const { width } = useViewportSize();
  
  return useMemo(() => {
    let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    
    if (width < APP_CONFIG.MOBILE_BREAKPOINT) {
      device = 'mobile';
    } else if (width < APP_CONFIG.DESKTOP_BREAKPOINT) {
      device = 'tablet';
    }
    
    return {
      device,
      isMobile: device === 'mobile',
      isTablet: device === 'tablet',
      isDesktop: device === 'desktop'
    };
  }, [width]);
}