import { CanvasSize } from "@/components/presenter/types";
import { useEffect, useState } from "react";

export const useSlideScale = ({ canvasSize, containerRef }: { canvasSize: CanvasSize, containerRef: React.RefObject<HTMLDivElement | null> }) => {
    const [scale, setScale] = useState(0.1);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let rafId: number | null = null;
        
        const updateScale = () => {
          if (!containerRef.current) return;
          
          // Cancel any pending animation frame
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
          }
          
          // Use requestAnimationFrame to batch updates and prevent flickering
          rafId = requestAnimationFrame(() => {
            if (!containerRef.current) return;
            
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            const scaleX = containerWidth / canvasSize.width;
            const scaleY = containerHeight / canvasSize.height;
            const newScale = Math.min(scaleX, scaleY);
            
            setScale(newScale);
            setIsReady(true);
          });
        };
    
        updateScale();
        window.addEventListener('resize', updateScale);
        
        // Use ResizeObserver for better container size tracking
        const resizeObserver = new ResizeObserver(updateScale);
        if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
        }
        
        return () => {
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
          }
          window.removeEventListener('resize', updateScale);
          resizeObserver.disconnect();
        };
      }, [canvasSize.width, canvasSize.height]);

    return { scale, isReady };
};