import { useEffect, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";

/**
 * Hook to convert media filenames to full asset:// URLs
 * If the src is already a full URL (http/https/asset), return it as-is
 * Otherwise, assume it's a filename and convert it to asset:// URL
 */
export const useMediaSrc = (src: string): string => {
  const [fullSrc, setFullSrc] = useState<string>(src);

  useEffect(() => {
    const convertSrc = async () => {
      // If already a full URL, use it as-is
      if (
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("asset://") ||
        src.startsWith("data:")
      ) {
        setFullSrc(src);
        return;
      }

      // Otherwise, assume it's a filename in the media directory
      // Get the media files path and convert to asset:// URL
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const mediaPath = await invoke<string>("get_media_file_path", {
          fileName: src,
        });
        const assetUrl = convertFileSrc(mediaPath);
        setFullSrc(assetUrl);
      } catch (error) {
        console.error("Failed to convert media src:", error);
        // Fallback to original src
        setFullSrc(src);
      }
    };

    convertSrc();
  }, [src]);

  return fullSrc;
};


