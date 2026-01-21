import { useState } from "react";
import { TagGroupItem } from "./TagGroupItem";
import { SlideTagGroup } from "@/components/feature/slide/slide-tag/types";

export type TagGroupFormProps = {
  initialName?: string;
  initialColor?: string;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
};

export const TagGroupForm = ({
  initialName = "",
  initialColor = "black",
  onSave,
}: TagGroupFormProps) => {
  const [tagGroup, setTagGroup] = useState<SlideTagGroup>({
    id: crypto.randomUUID(),
    name: initialName,
    color: initialColor,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagGroup.name.trim()) {
      onSave(tagGroup.name.trim(), tagGroup.color);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <TagGroupItem
        tagGroup={{
          id: crypto.randomUUID(),
          name: tagGroup.name,
          color: tagGroup.color,
        }}
        isEditing
        onUpdate={(updatedTagGroup) => setTagGroup(updatedTagGroup)}
      />
    </form>
  );
};
