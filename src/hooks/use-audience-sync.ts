import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";

interface ActiveSlide {
  id: string;
  data: SlideData;
  canvasSize: CanvasSize;
}

export const useAudienceSync = () => {
  const [activeSlide, setActiveSlide] = useState<ActiveSlide | null>(null);

  useEffect(() => {
    // Listen for active slide changes from the presenter window
    const unlisten = listen<ActiveSlide | null>(
      "active-slide-changed",
      (event) => {
        console.log("Audience received slide change:", event.payload);
        console.log("event.payload", event.payload);
        setActiveSlide(event.payload);
      }
    );

    // Cleanup listener on unmount
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return { activeSlide };
};
