// Helper function to convert MediaItem to SlideGroup for adding to playlists

import { SlideGroup } from "@/components/presenter/types";
import { DEFAULT_CANVAS_PRESET } from "@/consts/canvas";
import { MediaItem } from "../presenter/mediaLibraryStore";
import { mediaItemToSlideData } from "./mediaItemToSlideData";

export const mediaItemToSlideGroup = (mediaItem: MediaItem): SlideGroup => {
  // Convert media item to slide data
  const slideData = mediaItemToSlideData(mediaItem);

  // Create a slide group with the media slide
  return {
    id: crypto.randomUUID(),
    canvasSize: DEFAULT_CANVAS_PRESET.value,
    title: mediaItem.name,
    slides: [slideData],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

