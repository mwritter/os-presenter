import { Menu } from "@tauri-apps/api/menu";
import { useRef } from "react";

interface UseSlideContextMenuOptions {
  onCut: (targetSlideId: string) => void;
  onCopy: (targetSlideId: string) => void;
  onPaste: (afterSlideId: string) => void;
  onDelete: (targetSlideId: string) => void;
  hasClipboard: boolean;
}

export const useSlideContextMenu = ({
  onCut,
  onCopy,
  onPaste,
  onDelete,
  hasClipboard,
}: UseSlideContextMenuOptions) => {
  // Track which slide the context menu was opened on
  const contextMenuSlideIdRef = useRef<string | null>(null);

  const openContextMenu = async (e: React.MouseEvent, slideId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Store the slide ID for operations
    contextMenuSlideIdRef.current = slideId;

    const contextMenuItems = [
      {
        id: "slide-cut",
        text: "Cut",
        accelerator: "CmdOrCtrl+X",
        action: () => {
          if (contextMenuSlideIdRef.current) {
            onCut(contextMenuSlideIdRef.current);
          }
        },
      },
      {
        id: "slide-copy",
        text: "Copy",
        accelerator: "CmdOrCtrl+C",
        action: () => {
          if (contextMenuSlideIdRef.current) {
            onCopy(contextMenuSlideIdRef.current);
          }
        },
      },
      {
        id: "slide-paste",
        text: "Paste",
        accelerator: "CmdOrCtrl+V",
        enabled: hasClipboard,
        action: () => {
          if (contextMenuSlideIdRef.current) {
            onPaste(contextMenuSlideIdRef.current);
          }
        },
      },
      {
        id: "slide-delete",
        text: "Delete",
        accelerator: "Backspace",
        action: () => {
          if (contextMenuSlideIdRef.current) {
            onDelete(contextMenuSlideIdRef.current);
          }
        },
      },
    ];

    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};
