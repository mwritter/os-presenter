import { useEffect } from "react";

/**
 * Hook to set a consistent cursor during drag operations
 * Prevents the default "copy" cursor (green plus) from showing
 */
export const useGlobalDragCursor = () => {
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.dropEffect = "move";
      }
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.dropEffect = "move";
      }
    };

    // Use capture phase to catch events before they reach children
    document.addEventListener("dragover", handleDragOver, true);
    document.addEventListener("dragenter", handleDragEnter, true);

    return () => {
      document.removeEventListener("dragover", handleDragOver, true);
      document.removeEventListener("dragenter", handleDragEnter, true);
    };
  }, []);
};
