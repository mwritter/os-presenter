import { useAudienceSync } from "@/hooks/use-audience-sync";
import { AudienceSlide } from "../components/audiance/slide/AudienceSlide";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeAnimationDuration, useHideShow } from "./hooks/use-hide-show";

const AudienceView = () => {
  const { activeSlide } = useAudienceSync();
  const { isVisible, handleHideClick } = useHideShow();

  return (
    <div
      style={{ transitionDuration: `${FadeAnimationDuration}ms` }}
      className={cn(
        "w-full h-full relative group bg-black transition-opacity",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {activeSlide && (
        <AudienceSlide
          data={activeSlide.data}
          canvasSize={activeSlide.canvasSize}
          useCache
        />
      )}
      <div className="absolute bottom-10 left-10 h-[10%] aspect-square">
        <Button
          size="icon"
          variant="ghost"
          className="h-full w-full bg-white/25 backdrop-blur-2xl opacity-0 group-hover:opacity-50 hover:bg-white/50! rounded-full transition-opacity duration-300"
          onClick={handleHideClick}
          disabled={!isVisible}
        >
          <X className="size-15 text-black!" />
        </Button>
      </div>
    </div>
  );
};

export default AudienceView;
