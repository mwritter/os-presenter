import { Image, Monitor } from "lucide-react";
import { useMediaLibraryContext } from "../media-library/context";
import { IconButton } from "@/components/feature/icon-button/IconButton";
import { NavigationControls } from "./NavigationControls";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAudienceWindowState } from "./hooks/use-audience-window-state";
import { Search } from "./search/Search";

export const Toolbar = () => {
  const { toggle: toggleMediaLibrary } = useMediaLibraryContext();
  const { audienceWindowVisible, handleToggleAudienceWindow } =
    useAudienceWindowState();

  const handleDrag = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (e.button === 0 && !target.closest("button")) {
      e.preventDefault();
      await getCurrentWindow().startDragging();
    }
  };

  return (
    <div
      onMouseDown={handleDrag}
      className="flex gap-10 items-center p-2 pt-8 bg-shade-1 border-b border-black/50 w-full overflow-x-auto [scrollbar-width:none] select-none overflow-hidden"
    >
      <div className="flex items-center gap-2">
        <Search />
      </div>
      <NavigationControls />
      <div className="flex items-center gap-2">
        <IconButton Icon={Image} label="Media" onClick={toggleMediaLibrary} />
        <IconButton
          Icon={Monitor}
          label={"Audience"}
          onClick={handleToggleAudienceWindow}
          className={audienceWindowVisible ? "ring-2 ring-amber-400" : ""}
        />
      </div>
    </div>
  );
};
