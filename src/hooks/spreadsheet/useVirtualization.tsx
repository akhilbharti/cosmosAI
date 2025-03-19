
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  VisibleRange, 
  calculateVisibleRange 
} from '../../utils/spreadsheetUtils';

export const useVirtualization = () => {
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    startRow: 0,
    endRow: 50,
    startCol: 0,
    endCol: 20
  });
  
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  
  // Optimized scroll handler with throttling for better performance
  const handleScroll = useCallback(() => {
    if (!gridRef.current) return;
    
    // Cancel any pending scroll updates to avoid excessive recalculations
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    
    // Throttle the scroll event to improve performance
    scrollTimeoutRef.current = window.setTimeout(() => {
      if (!gridRef.current) return;
      
      const { scrollLeft, scrollTop, clientWidth, clientHeight } = gridRef.current;
      
      // Calculate new visible range based on current scroll position
      const newVisibleRange = calculateVisibleRange(
        scrollLeft,
        scrollTop,
        clientWidth,
        clientHeight
      );
      
      // Only update state if the visible range has changed
      setVisibleRange(prev => {
        if (
          prev.startRow === newVisibleRange.startRow &&
          prev.endRow === newVisibleRange.endRow &&
          prev.startCol === newVisibleRange.startCol &&
          prev.endCol === newVisibleRange.endCol
        ) {
          return prev; // No change needed
        }
        
        return newVisibleRange;
      });
      
      scrollTimeoutRef.current = null;
    }, 16); // ~60fps (1000ms / 60 ≈ 16ms)
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    visibleRange,
    gridRef,
    handleScroll
  };
};
