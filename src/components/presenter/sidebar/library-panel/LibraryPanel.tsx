import { PlaylistItem } from "./PlaylistItem";
import { LibraryItem } from "./LibraryItem";
import {
  usePresenterStore,
  selectLibraries,
  selectPlaylists,
} from "@/stores/presenterStore";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePresenterContext } from "@/context/presenter";

// Displays the libraries and playlists in the sidebar
// only one can be selected at a time

export const LibraryPanel = () => {
  const { openAddPresentationDialog } = usePresenterContext();
  const libraries = usePresenterStore(selectLibraries);
  const playlists = usePresenterStore(selectPlaylists);
  const addLibrary = usePresenterStore((state) => state.addLibrary);
  const addPlaylist = usePresenterStore((state) => state.addPlaylist);

  const handleNewLibrary = () => {
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

  return (
    <div className="flex flex-col gap-1 overflow-y-auto h-full">
      <div>
        <LibraryPanelHeader 
          title="Library" 
          withMenu 
          onNewLibrary={handleNewLibrary}
          onNewPlaylist={handleNewPlaylist}
          onNewPresentation={handleNewPresentation}
        />
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
  onNewLibrary,
  onNewPlaylist,
  onNewPresentation,
}: {
  title: string;
  withMenu?: boolean;
  onNewLibrary?: () => void;
  onNewPlaylist?: () => void;
  onNewPresentation?: () => void;
}) => {
  return (
    <div className="p-2 flex items-center justify-between">
      <p className="text-gray-400 font-bold text-xs uppercase">{title}</p>
      {withMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-sm text-gray-400 hover:bg-white/10 hover:text-gray-400" variant="ghost" size="icon-xs">
              <Plus className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="dark">
            <DropdownMenuItem onClick={onNewLibrary}>New Library</DropdownMenuItem>
            <DropdownMenuItem onClick={onNewPlaylist}>New Playlist</DropdownMenuItem>
            <DropdownMenuItem onClick={onNewPresentation}>New Presentation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
