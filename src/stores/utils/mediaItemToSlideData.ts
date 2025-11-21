// Helper function to convert MediaItem to SlideData for use with Slide component

import {
  ImageObject,
  SlideData,
  VideoObject,
} from "@/components/feature/slide/types";
import { DEFAULT_CANVAS_PRESET } from "@/consts/canvas";
import { MediaItem } from "../mediaLibraryStore";

// Currently always show the image or video as Full HD (1920x1080)
export const mediaItemToSlideData = (mediaItem: MediaItem): SlideData => {
  const imageProps = {
    id: mediaItem.id,
    type: "image",
    src: mediaItem.source,
    position: { x: 0, y: 0 },
    size: DEFAULT_CANVAS_PRESET.value,
    zIndex: 0,
    rotation: 0,
    objectFit: "contain",
  } satisfies ImageObject;

  const videoProps = {
    id: mediaItem.id,
    type: "video",
    src: mediaItem.source,
    videoType: "background", // Media library videos are controllable
    thumbnail: mediaItem.thumbnail, // Use media library thumbnail
    position: { x: 0, y: 0 },
    size: DEFAULT_CANVAS_PRESET.value,
    zIndex: 0,
    rotation: 0,
    autoPlay: true, // All videos auto-play by default
    loop: true, // All videos loop by default
    muted: false, // Background videos should have audio
    isLocked: true, // Background videos are locked (not editable in edit view)
  } satisfies VideoObject;

  return {
    id: `media-${mediaItem.id}`,
    objects: mediaItem.type === "image" ? [imageProps] : [videoProps],
  };
};
