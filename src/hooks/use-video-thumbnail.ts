import { useMediaLibraryStore } from "@/stores/presenter/mediaLibraryStore";

/**
 * Hook to get the thumbnail for a video object by looking up the media library
 * based on the video's source filename (which contains the media ID)
 *
 * @param videoSrc - The video source (e.g., "abc-123.mp4")
 * @param existingThumbnail - Thumbnail already set on the video object (takes priority)
 * @returns The thumbnail URL or undefined
 */
export const useVideoThumbnail = (
  videoSrc: string,
  existingThumbnail?: string
): string | undefined => {
  const getMediaById = useMediaLibraryStore((state) => state.getMediaById);

  // If thumbnail is already set, use it
  if (existingThumbnail) {
    return existingThumbnail;
  }

  // Extract the media ID from the video source filename
  // Format is typically "uuid.ext" or just "uuid.mp4"
  const filename = videoSrc.split("/").pop() || videoSrc;
  const mediaId = filename.split(".")[0]; // Get the part before the extension

  // Look up the media item in the library
  const mediaItem = getMediaById(mediaId);

  // Return the thumbnail if found
  return mediaItem?.thumbnail;
};
