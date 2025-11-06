import {
  Image,
  LetterText,
  Paintbrush,
  Search,
} from "lucide-react";
import { useMediaLibraryContext } from "../media-library/context";
import { IconButton } from "@/components/feature/icon-button/IconButton";
import { NavigationControls } from "./NavigationControls";

//  TODO: add functionality to the toolbar
export const Toolbar = () => {
    const { toggle: toggleMediaLibrary } = useMediaLibraryContext();
  return (
    <div className="flex gap-10 items-center p-2 bg-shade-1 border-b border-black/50 w-full overflow-x-auto [scrollbar-width:none]">
      <div className="flex items-center gap-2">
        <IconButton Icon={Search} label="Search" />
        <IconButton Icon={LetterText} label="Text" />
        <IconButton Icon={Paintbrush} label="Theme" />
      </div>
      <NavigationControls />
      <div className="flex items-center gap-2">
        <IconButton Icon={Image} label="Media" onClick={toggleMediaLibrary} />
      </div>
    </div>
  );
};
