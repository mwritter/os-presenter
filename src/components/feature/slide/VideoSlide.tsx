import { SlideData } from "./types";

export const VideoSlide = ({ data }: { data: SlideData }) => {
  return (
    <video
    controls
      src={data.background?.value}
      loop
      muted
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "8px",
      }}
    />
  );
};
