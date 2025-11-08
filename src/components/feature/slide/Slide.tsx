import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { SlideData } from "./types";
import { getBackgroundStyle } from "./util/getBackgroundStyle";
import { cn } from "@/lib/utils";
import { selectActiveSlideId, usePresenterStore } from "@/stores/presenterStore";
import { SlideObjectRenderer } from "./SlideObjectRenderer";
import { CanvasSize } from "@/components/presenter/types";

export type SlideProps = {
  id: string;
  data: SlideData;
  as?: 'button' | 'div';
  isEditable?: boolean;
  selectedObjectId?: string | null;
  onResizeStart?: (objectId: string, handle: string, e: React.MouseEvent) => void;
  canvasSize?: CanvasSize; // Fixed canvas dimensions for scaling
};

export const Slide = ({ 
  id, 
  data, 
  as = 'button',
  isEditable = false,
  selectedObjectId = null,
  onResizeStart,
  canvasSize = { width: 1920, height: 1080 }, // Default Full HD
}: SlideProps) => {
  const activeSlideId = usePresenterStore(selectActiveSlideId);
  const setActiveSlide = usePresenterStore((state) => state.setActiveSlide);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.1);
  const [isReady, setIsReady] = useState(false);
  
  const isActive = activeSlideId === id;

  // Calculate scale to fit container
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

  const handleClick = () => {
    setActiveSlide(id, data);
  };

  // Use backgroundColor if available, otherwise fall back to legacy background
  // Memoize to prevent recalculation on every render
  const backgroundStyle = useMemo(() => {
    return data.backgroundColor 
      ? { backgroundColor: data.backgroundColor }
      : getBackgroundStyle(data, canvasSize);
  }, [data.backgroundColor, data.background, canvasSize.width, canvasSize.height]);
    
  // Canvas style - fixed size that gets scaled
  const canvasStyle: CSSProperties = {
    ...backgroundStyle,
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: 'center center',
    overflow: 'hidden',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    opacity: isReady ? 1 : 0,
  };

  const Comp = as === 'button' ? 'button' : 'div';

  return (
    <div
      ref={containerRef}
      key={id}
      className="flex flex-col gap-4 aspect-video w-full relative"
    >
      <Comp
        type="button"
        onClick={as === 'button' ? handleClick : undefined}
        className={cn(
          "rounded-xs transition-all duration-200 w-full h-full relative",
          {
            "ring-1 ring-amber-400": isActive,
            "hover:ring-2 hover:ring-white/30": !isActive && as === 'button',
          }
        )}
      >
        <div style={canvasStyle}>
          {data.objects && data.objects.length > 0 && (
            <SlideObjectRenderer
              objects={data.objects}
              isEditable={isEditable}
              selectedObjectId={selectedObjectId}
              onResizeStart={onResizeStart}
            />
          )}
        </div>
      </Comp>
    </div>
  );
};
