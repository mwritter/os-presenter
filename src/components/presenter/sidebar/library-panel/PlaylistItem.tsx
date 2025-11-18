import { List } from "lucide-react";
import {
  usePlaylistStore,
  useSelectionStore,
} from "@/stores/presenterStore";
import { LibraryPanelItem } from "./LibraryPanelItem";

type PlaylistItemProps = {
  id: string;
  name: string;
};

export const PlaylistItem = ({ id, name }: PlaylistItemProps) => {
  const selectedPlaylistId = useSelectionStore((s) => s.selectedPlaylistId);
  const selectPlaylist = useSelectionStore((s) => s.selectPlaylist);
  const isSelected = selectedPlaylistId === id;
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);
  const removePlaylist = usePlaylistStore((s) => s.removePlaylist);

  return (
    <LibraryPanelItem
      id={id}
      name={name}
      icon={
        <div className="bg-blue-400 rounded-xs p-[2px]">
          <List className="size-3.5" color="white" />
        </div>
      }
      onUpdate={updatePlaylist}
      onDelete={removePlaylist}
      onSelect={selectPlaylist}
      isSelected={isSelected}
    />
  );
};
