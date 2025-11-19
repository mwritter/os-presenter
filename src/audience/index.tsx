import { useAudienceSync } from "@/hooks/use-audience-sync";
import { AudienceSlide } from "../components/audiance/slide/AudienceSlide";

const AudienceView = () => {
  const { activeSlide } = useAudienceSync();

  if (!activeSlide) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/50 text-2xl">
          Waiting for presentation...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <AudienceSlide
        data={activeSlide.data}
        canvasSize={activeSlide.canvasSize}
      />
    </div>
  );
};

export default AudienceView;
