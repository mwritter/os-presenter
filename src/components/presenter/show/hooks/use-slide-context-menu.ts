import { usePresenterStore } from "@/stores/presenter/presenterStore";
import { useSettingsStore } from "@/stores/settings/settingsStore";
import { Menu } from "@tauri-apps/api/menu";
import { useMemo, useRef } from "react";
import { createColorSwatchIcon } from "@/utils/createColorSwatchIcon";
import { openSettingsWindow } from "@/utils/openSettingsWindow";
import { Image } from "@tauri-apps/api/image";

interface UseSlideContextMenuOptions {
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
  playlistId,
  playlistItemId,
  hasClipboard,
}: UseSlideContextMenuOptions) => {
  // Track which slide the context menu was opened on
  const contextMenuSlideIdRef = useRef<string | null>(null);
  const tagGroups = useSettingsStore((s) => s.tagGroups);
  const updateSlide = usePresenterStore((s) => s.updateSlideInPlaylistItem);

  const tagGroupIconMap = useMemo(() => {
    const iconMap = new Map<string, Image>();
    tagGroups.forEach(async (tagGroup) => {
      if (iconMap.has(tagGroup.id)) return;
      iconMap.set(tagGroup.id, await createColorSwatchIcon(tagGroup.color));
    });
    return iconMap;
  }, [tagGroups]);

  const handleGroup = (targetSlideId: string, tagGroupId: string) => {
    if (playlistId && playlistItemId) {
      updateSlide(playlistId, playlistItemId, targetSlideId, { tagGroupId });
    }
  };

  const openContextMenu = async (e: React.MouseEvent, slideId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Store the slide ID for operations
    contextMenuSlideIdRef.current = slideId;

    const tagGroupItems = tagGroups.map((tagGroup) => ({
      id: `slide-group-tag-group-${tagGroup.id}`,
      text: tagGroup.name,
      icon: tagGroupIconMap.get(tagGroup.id),
      action: () => {
        if (contextMenuSlideIdRef.current) {
          handleGroup(contextMenuSlideIdRef.current, tagGroup.id);
        }
      },
    }))

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
