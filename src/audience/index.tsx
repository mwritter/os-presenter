import { useAudienceSync } from "@/hooks/use-audience-sync";
import { AudienceSlide } from "../components/audiance/slide/AudienceSlide";

const AudienceView = () => {
  const { activeSlide } = useAudienceSync();

  return (
    <div className="w-full h-full">
      {activeSlide && (
        <AudienceSlide
          key={activeSlide.id}
          data={activeSlide.data}
          canvasSize={activeSlide.canvasSize}
        />
      )}
    </div>
  );
};

export default AudienceView;
