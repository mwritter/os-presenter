import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import { selectSelectedPlaylist, usePresenterStore } from "@/stores/presenterStore";
import { selectSelectedLibrary } from "@/stores/presenterStore";

export const ItemPanelHeader = () => {
  const selectedLibrary = usePresenterStore(selectSelectedLibrary);
  const selectedPlaylist = usePresenterStore(selectSelectedPlaylist);
  
  if (selectedLibrary) {
    return <ItemPanelLibraryHeader />;
  }
  if (selectedPlaylist) {
    return <ItemPanelPlaylistHeader />;
  }
  return <ItemPanelLibraryHeader />;;
};

const ItemPanelLibraryHeader = () => {
  const selectedLibrary = usePresenterStore(selectSelectedLibrary);
  return (
    <div className="flex justify-between items-center text-[10px] uppercase p-2 bg-shade-3">
      <span className="text-gray-400">{selectedLibrary?.slideGroups.length} items</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-sm text-gray-400 hover:bg-white/10 hover:text-gray-400"
            variant="ghost"
            size="icon-xs"
          >
            <Plus className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="dark">
          <DropdownMenuItem>New Presentation</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const ItemPanelPlaylistHeader = () => {
  const selectedPlaylist = usePresenterStore(selectSelectedPlaylist);
  return (
    <div className="flex justify-between items-center text-[10px] uppercase p-2 bg-shade-3">
      <span className="text-gray-400">{selectedPlaylist?.items.length} items</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-sm text-gray-400 hover:bg-white/10 hover:text-gray-400"
            variant="ghost"
            size="icon-xs"
          >
            <Plus className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="dark">
          <DropdownMenuItem>New Header</DropdownMenuItem>
          <DropdownMenuItem>New Placeholder</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};