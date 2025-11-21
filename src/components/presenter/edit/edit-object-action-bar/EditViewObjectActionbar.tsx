import { Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { useEditContext } from "@/presenter/edit/context";
import { AddShapeActionbarButton } from "./AddShapeActionbarButton";
import { EditViewObjectActionbarButton } from "./EditViewObjectActionbarButton";
import { open } from "@tauri-apps/plugin-dialog";
import { useMediaLibraryStore } from "@/stores/mediaLibraryStore";
import { useState } from "react";

export const EditViewObjectActionbar = () => {
  const { addTextObject, addImageObject, addVideoObject } = useEditContext();
  const importMedia = useMediaLibraryStore((state) => state.importMedia);
  const [isImporting, setIsImporting] = useState(false);

  const getImageDimensions = (
    src: string
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    });
  };

  const getVideoDimensions = (
    src: string
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight });
      };
      video.onerror = reject;
      video.src = src;
    });
  };

  const handleAddImage = async () => {
    try {
      setIsImporting(true);
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Image Files",
            extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        const mediaItem = await importMedia(selected);
        // mediaItem.source is already the full URL after importMedia, use it directly
        const dimensions = await getImageDimensions(mediaItem.source);

        // Extract just the filename from the full URL
        // Decode the entire URL first, then split on / to get the last part (filename)
        const decodedUrl = decodeURIComponent(mediaItem.source);
        const pathParts = decodedUrl.split("/");
        const filename = pathParts[pathParts.length - 1];

        // Use the relative filename for storage, but pass dimensions
        addImageObject(filename, dimensions);
      }
    } catch (error) {
      console.error("Failed to import image:", error);
      alert(`Failed to import image: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddVideo = async () => {
    try {
      setIsImporting(true);
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Video Files",
            extensions: ["mp4", "webm", "mov", "avi", "mkv"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        const mediaItem = await importMedia(selected);
        // mediaItem.source is already the full URL after importMedia, use it directly
        const dimensions = await getVideoDimensions(mediaItem.source);

        // Extract just the filename from the full URL
        // Decode the entire URL first, then split on / to get the last part (filename)
        const decodedUrl = decodeURIComponent(mediaItem.source);
        const pathParts = decodedUrl.split("/");
        const filename = pathParts[pathParts.length - 1];

        // Extract thumbnail filename if available
        let thumbnailFilename: string | undefined;
        if (mediaItem.thumbnail) {
          const decodedThumbUrl = decodeURIComponent(mediaItem.thumbnail);
          const thumbParts = decodedThumbUrl.split("/");
          thumbnailFilename = thumbParts[thumbParts.length - 1];
        }

        // Use the relative filename for storage, pass dimensions and thumbnail
        addVideoObject(filename, dimensions, thumbnailFilename);
      }
    } catch (error) {
      console.error("Failed to import video:", error);
      alert(`Failed to import video: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="absolute top-5 z-30 flex justify-center w-full pointer-events-none">
      <div className="flex items-center gap-2 bg-shade-3/45 backdrop-blur-sm rounded-md p-1 pointer-events-auto">
        <EditViewObjectActionbarButton
          icon={<p className="font-bold">T</p>}
          label="Text"
          onClick={addTextObject}
          disabled={isImporting}
        />

        <AddShapeActionbarButton disabled={isImporting} />

        <EditViewObjectActionbarButton
          icon={<ImageIcon />}
          label="Image"
          onClick={handleAddImage}
          disabled={isImporting}
        />
        <EditViewObjectActionbarButton
          withOutDevider
          icon={<VideoIcon />}
          label="Video"
          onClick={handleAddVideo}
          disabled={isImporting}
        />
      </div>
    </div>
  );
};
