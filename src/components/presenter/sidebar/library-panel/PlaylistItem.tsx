import { List } from "lucide-react";
import { usePresenterStore, selectSelectedPlaylistId } from "@/stores/presenterStore";

type PlaylistItemProps = {
  id: string;
  name: string;
};

export const PlaylistItem = ({ id, name }: PlaylistItemProps) => {
  const selectedPlaylistId = usePresenterStore(selectSelectedPlaylistId);
  const selectPlaylist = usePresenterStore((state) => state.selectPlaylist);
  const isSelected = selectedPlaylistId === id;

  return (
    <button
      onClick={() => selectPlaylist(id)}
      className={`flex items-center gap-2 py-1 pl-5 hover:bg-white/10 w-full ${
        isSelected ? "bg-white/20" : ""
      }`}
    >
      <div className="bg-blue-400 rounded-xs p-[2px]">
        <List className="size-3.5" color="white" />
      </div>
      <div className="text-white text-xs whitespace-nowrap text-ellipsis overflow-hidden" key={id}>
        {name}
      </div>
    </button>
  );
};