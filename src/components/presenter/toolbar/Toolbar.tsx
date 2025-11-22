import { Image, LetterText, Monitor, Paintbrush, Search } from "lucide-react";
import { useMediaLibraryContext } from "../media-library/context";
import { IconButton } from "@/components/feature/icon-button/IconButton";
import { NavigationControls } from "./NavigationControls";
import { useState, useEffect } from "react";
import {
  openAudienceWindow,
  closeAudienceWindow,
  isAudienceWindowOpen,
} from "@/services/audience";

//  TODO: add functionality to the toolbar
export const Toolbar = () => {
  const { toggle: toggleMediaLibrary } = useMediaLibraryContext();
  const [audienceWindowOpen, setAudienceWindowOpen] = useState(false);

  // Check if audience window is open on mount
  useEffect(() => {
    checkAudienceWindowStatus();
  }, []);

  const checkAudienceWindowStatus = async () => {
    try {
      const isOpen = await isAudienceWindowOpen();
      setAudienceWindowOpen(isOpen);
    } catch (error) {
      console.error("Failed to check audience window status:", error);
    }
  };

  const handleToggleAudienceWindow = async () => {
    try {
      if (audienceWindowOpen) {
        await closeAudienceWindow();
        setAudienceWindowOpen(false);
      } else {
        await openAudienceWindow();
        setAudienceWindowOpen(true);
      }
    } catch (error) {
      console.error("Failed to toggle audience window:", error);
      // Re-check status in case of error
      checkAudienceWindowStatus();
    }
  };

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
        <IconButton
          Icon={Monitor}
          label={audienceWindowOpen ? "Close Audience" : "Open Audience"}
          onClick={handleToggleAudienceWindow}
          className={audienceWindowOpen ? "ring-2 ring-amber-400" : ""}
        />
      </div>
    </div>
  );
};
