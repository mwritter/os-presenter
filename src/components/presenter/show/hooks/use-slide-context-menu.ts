import { SlideData } from "@/components/feature/slide/types";
import { usePresenterStore } from "@/stores/presenter/presenterStore";
import { useSettingsStore } from "@/stores/settings/settingsStore";
import { Menu } from "@tauri-apps/api/menu";
import { Image } from "@tauri-apps/api/image";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useRef } from "react";

/**
 * Open the settings window at a specific section
 */
async function openSettingsWindow(path: string = "/settings") {
  const existingWindow = await WebviewWindow.getByLabel("settings");
  
  if (existingWindow) {
    // Window exists - show it and navigate to the path
    await existingWindow.show();
    await existingWindow.setFocus();
    // Navigate to the specific section by emitting a navigation event
    // The settings window will listen for this
    await existingWindow.emit("settings:navigate", { path });
  } else {
    // Create new window at the specific path
    const settingsWindow = new WebviewWindow("settings", {
      url: path,
      title: "Settings",
      width: 700,
      height: 500,
      minWidth: 500,
      minHeight: 400,
      resizable: true,
    });
    
    // Wait for window to be created
    settingsWindow.once("tauri://created", () => {
      console.log("Settings window created");
    });
    
    settingsWindow.once("tauri://error", (e) => {
      console.error("Error creating settings window:", e);
    });
  }
}

/**
 * Parse a color string to RGB values
 * Supports: #RGB, #RRGGBB, rgb(r,g,b), rgba(r,g,b,a), and common CSS color names
 */
function parseColor(color: string): { r: number; g: number; b: number } {
  // Handle hex colors
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    
    // Expand short hex (#RGB -> #RRGGBB)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Check for NaN (invalid hex)
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  }
  
  // Handle rgba() or rgb() format - matches "rgba(255, 128, 64, 1)" or "rgb(255, 128, 64)"
  const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
    };
  }
  
  // Fallback to black
  console.warn(`Could not parse color: ${color}, falling back to black`);
  return { r: 0, g: 0, b: 0 };
}

/**
 * Create a color swatch image for menu icons
 * Creates a small solid color square (12x12 pixels)
 */
async function createColorSwatchIcon(colorString: string): Promise<Image> {
  const size = 12;
  const { r, g, b } = parseColor(colorString);
  
  // Create RGBA pixel data (12x12 = 144 pixels, 4 bytes each)
  const pixels = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    pixels[i * 4] = r;     // Red
    pixels[i * 4 + 1] = g; // Green
    pixels[i * 4 + 2] = b; // Blue
    pixels[i * 4 + 3] = 255; // Alpha (fully opaque)
  }
  
  return Image.new(pixels, size, size);
}

interface UseSlideContextMenuOptions {
  slides: SlideData[];
  onCut: (targetSlideId: string) => void;
  onCopy: (targetSlideId: string) => void;
  onPaste: (afterSlideId: string) => void;
  onDelete: (targetSlideId: string) => void;
  playlistId?: string;
  playlistItemId?: string;
  hasClipboard: boolean;
}

export const useSlideContextMenu = ({
  onCut,
  onCopy,
  onPaste,
  onDelete,
  slides,
  playlistId,
  playlistItemId,
  hasClipboard,
}: UseSlideContextMenuOptions) => {
  // Track which slide the context menu was opened on
  const contextMenuSlideIdRef = useRef<string | null>(null);
  const tagGroups = useSettingsStore((s) => s.tagGroups);
  const updateSlide = usePresenterStore((s) => s.updateSlideInPlaylistItem);
  const handleGroup = (targetSlideId: string, tagGroupId: string) => {
    // TODO: updated target slide with tag group
    const slide = slides.find((s) => s.id === targetSlideId);
    const tagGroup = tagGroups.find((t) => t.id === tagGroupId);
    if (tagGroup) {
      console.log({playlistId, playlistItemId, slide, tagGroup});
      if (playlistId && playlistItemId) {
        updateSlide(playlistId, playlistItemId, targetSlideId, { tagGroup });
      }
    }
  };

  const openContextMenu = async (e: React.MouseEvent, slideId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Store the slide ID for operations
    contextMenuSlideIdRef.current = slideId;

    const tagGroupItems = await Promise.all(
      tagGroups.map(async (tagGroup) => ({
        id: `slide-group-tag-group-${tagGroup.id}`,
        text: tagGroup.name,
        icon: await createColorSwatchIcon(tagGroup.color),
        action: () => {
          if (contextMenuSlideIdRef.current) {
            handleGroup(contextMenuSlideIdRef.current, tagGroup.id);
          }
        },
      }))
    );

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
      {
        item: "Separator" as const,
      },
      // Tag group submenu with color swatch icons
      {
        id: "slide-group",
        text: "Group",
        action: () => {},
        items: [...tagGroupItems, { item: "Separator" as const }, {
          id: "slide-group-settings",
          text: "Settings",
          action: () => {
            openSettingsWindow("/settings/tag-groups");
          },
        }],
      },
    ];

    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};
