import { SlideTagGroup } from "@/components/feature/slide/slide-tag/types";
import { ColorPicker } from "@/components/feature/color-picker/ColorPicker";
import { useState } from "react";
import { useSettingsStore } from "@/stores/settings/settingsStore";
import { cn } from "@/lib/utils";

export type TagGroupItemProps = {
  tagGroup: SlideTagGroup;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onUpdate?: (tagGroup: SlideTagGroup) => void;
  isSelected?: boolean;
  onSelect?: (id: string, event: React.MouseEvent) => void;
};

export const TagGroupItem = ({
  tagGroup,
  isEditing = false,
  onEditingChange,
  onUpdate,
  isSelected,
  onSelect,
}: TagGroupItemProps) => {
  const [_isEditing, setIsEditing] = useState(isEditing);
  const updateTagGroup = useSettingsStore((state) => state.updateTagGroup);

  // Sync with prop changes (for when parent sets editing state)
  if (isEditing && !_isEditing) {
    setIsEditing(true);
  }

  const handleSetEditing = (editing: boolean) => {
    setIsEditing(editing);
    onEditingChange?.(editing);
  };

  const handleNameOnChange = (name: string) => {
    if (onUpdate) {
      onUpdate({ ...tagGroup, name });
      return;
    }
    updateTagGroup(tagGroup.id, { name });
  };

  const handleColorOnChange = (color: string) => {
    if (onUpdate) {
      onUpdate({ ...tagGroup, color });
      return;
    }
    updateTagGroup(tagGroup.id, { color });
  };

  return (
    <div
      className={cn(
        "flex flex-1 p-1 items-center justify-between gap-3 odd:bg-black/10",
        {
          "bg-selected!": isSelected,
        }
      )}
      onClick={(e) => onSelect?.(tagGroup.id, e)}
      onDoubleClick={() => handleSetEditing(true)}
    >
      {_isEditing ? (
        <input
          className="text-white text-xs flex-1 w-full outline-none bg-black"
          autoFocus
          placeholder="Tag group name"
          value={tagGroup.name}
          onChange={(e) => handleNameOnChange(e.target.value)}
          onBlur={() => handleSetEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") {
              handleSetEditing(false);
            }
          }}
        />
      ) : (
        <div className="text-xs h-full flex items-center">{tagGroup.name}</div>
      )}
      <ColorPicker value={tagGroup.color} onChange={handleColorOnChange} />
    </div>
  );
};
