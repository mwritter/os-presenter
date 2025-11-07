import { List } from "lucide-react";
import {
  usePresenterStore,
  selectSelectedPlaylistId,
} from "@/stores/presenterStore";
import { LibraryPanelItem } from "./LibraryPanelItem";

type PlaylistItemProps = {
  id: string;
  name: string;
};

export const PlaylistItem = ({ id, name }: PlaylistItemProps) => {
  const selectedPlaylistId = usePresenterStore(selectSelectedPlaylistId);
  const selectPlaylist = usePresenterStore((state) => state.selectPlaylist);
  const isSelected = selectedPlaylistId === id;
  const updatePlaylist = usePresenterStore((state) => state.updatePlaylist);
  const removePlaylist = usePresenterStore((state) => state.removePlaylist);

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
