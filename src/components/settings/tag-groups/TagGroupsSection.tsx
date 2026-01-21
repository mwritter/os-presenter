import { SlideTagGroup } from "@/components/feature/slide/slide-tag/types";
import { useSettingsStore } from "@/stores/settings/settingsStore";
import { Tag } from "lucide-react";
import { useState } from "react";
import { TagGroupForm } from "./TagGroupsForm";
import { TagGroupItem } from "./TagGroupItem";
import { TagGroupsFooter } from "./TagGroupsFooter";
import { useTagGroupMultiSelect } from "./hooks/use-tag-group-multi-select";
// TODO: handle the navigation back and forward buttons

export type TagGroupsSectionProps = {
  tagGroups: SlideTagGroup[];
  isLoading: boolean;
};

export const TagGroupsSection = ({ tagGroups }: TagGroupsSectionProps) => {
  const createTagGroup = useSettingsStore((state) => state.createTagGroup);
  const deleteTagGroup = useSettingsStore((state) => state.deleteTagGroup);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { selectedIds, handleSelect, clearSelection } =
    useTagGroupMultiSelect();

  const tagGroupIds = tagGroups.map((tg) => tg.id);

  const handleCreate = async (name: string, color: string) => {
    await createTagGroup(name, color);
    setIsCreating(false);
  };

  const handleAddNew = async () => {
    const newTagGroup = await createTagGroup("New Tag Group", "black");
    setEditingId(newTagGroup.id);
  };

  const onSelect = (id: string, event: React.MouseEvent) => {
    handleSelect(id, event, tagGroupIds);
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      await deleteTagGroup(id);
    }
    clearSelection();
  };

  return (
    <div className="max-w-2xl flex flex-col flex-1 p-4 rounded-lg bg-white/5">
      <div className="flex flex-col">
        {tagGroups.length === 0 && !isCreating ? (
          <div className="text-center py-12 bg-white/5 rounded-lg">
            <Tag className="w-10 h-10 text-white/30 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No tag groups yet.</p>
            <p className="text-white/40 text-xs mt-1">
              Create a tag group to organize your slides.
            </p>
          </div>
        ) : (
          tagGroups.map((tagGroup) => (
            <TagGroupItem
              key={tagGroup.id}
              tagGroup={tagGroup}
              isEditing={editingId === tagGroup.id}
              onEditingChange={(editing) => !editing && setEditingId(null)}
              isSelected={selectedIds.includes(tagGroup.id)}
              onSelect={onSelect}
            />
          ))
        )}
        {isCreating && (
          <TagGroupForm
            onSave={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        )}
      </div>
      <TagGroupsFooter
        selectedCount={selectedIds.length}
        onDeleteSelected={handleDeleteSelected}
        onAdd={handleAddNew}
      />
    </div>
  );
};
