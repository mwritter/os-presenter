import { useMediaLibraryStore } from "@/stores/mediaLibraryStore";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";

export const useImportMedia = () => {
    const [isImporting, setIsImporting] = useState(false);
  const importMedia = useMediaLibraryStore((state) => state.importMedia);

  const handleImport = async () => {
    try {
      setIsImporting(true);
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Media Files",
            extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "mp4", "webm", "mov", "avi", "mkv"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        await importMedia(selected);
      }
    } catch (error) {
      console.error("Failed to import media:", error);
      alert(`Failed to import media: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    handleImport,
  };
};