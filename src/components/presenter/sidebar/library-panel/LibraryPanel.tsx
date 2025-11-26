import { PlaylistItem } from "./PlaylistItem";
import { LibraryItem } from "./LibraryItem";
import { useLibraryStore, usePlaylistStore } from "@/stores/presenterStore";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePresenterContext } from "@/context/presenter";
import { useLibraryPanelContextMenu } from "./hooks/use-library-panel-context-menu";

export const LibraryPanel = () => {
  const libraries = useLibraryStore((s) => s.libraries);
  const playlists = usePlaylistStore((s) => s.playlists);

  return (
    <div className="flex flex-col gap-1 overflow-y-auto h-full">
      <div>
        <LibraryPanelHeader title="Library" withMenu />
        {libraries.map((library) => (
          <LibraryItem key={library.id} id={library.id} name={library.name} />
        ))}
      </div>
      <div>
        <LibraryPanelHeader title="Playlist" />
        {playlists.map((playlist) => (
          <PlaylistItem
            key={playlist.id}
            id={playlist.id}
            name={playlist.name}
          />
        ))}
      </div>
    </div>
  );
};

const LibraryPanelHeader = ({
  title,
  withMenu = false,
}: {
  title: string;
  withMenu?: boolean;
}) => {
  const { openAddPresentationDialog } = usePresenterContext();
  const libraries = useLibraryStore((s) => s.libraries);
  const playlists = usePlaylistStore((s) => s.playlists);
  const addLibrary = useLibraryStore((s) => s.addLibrary);
  const addPlaylist = usePlaylistStore((s) => s.addPlaylist);

  const handleNewLibrary = () => {
    console.log("handle New Library");
    const now = new Date().toISOString();
    const newLibrary = {
      id: crypto.randomUUID(),
      name: `Library ${libraries.length + 1}`,
      slideGroups: [],
      createdAt: now,
      updatedAt: now,
    };
    addLibrary(newLibrary);
  };

  const handleNewPlaylist = () => {
    const now = new Date().toISOString();
    const newPlaylist = {
      id: crypto.randomUUID(),
      name: `Playlist ${playlists.length + 1}`,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    addPlaylist(newPlaylist);
  };

  const handleNewPresentation = () => {
    openAddPresentationDialog();
  };

  const { openContextMenu } = useLibraryPanelContextMenu({
    onNewLibrary: handleNewLibrary,
    onNewPlaylist: handleNewPlaylist,
    onNewPresentation: handleNewPresentation,
  });

  return (
    <div className="p-2 flex items-center justify-between">
      <p className="text-gray-400 font-bold text-xs uppercase">{title}</p>
      {withMenu && (
        <Button
          className="rounded-sm text-gray-400 hover:bg-white/10 hover:text-gray-400"
          variant="ghost"
          size="icon-xs"
          onClick={(e) => openContextMenu(e)}
        >
          <Plus className="size-3" />
        </Button>
      )}
    </div>
  );
};
