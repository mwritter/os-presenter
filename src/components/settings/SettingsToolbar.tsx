import { getCurrentWindow } from "@tauri-apps/api/window";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

// Map routes to display names
const sectionNames: Record<string, string> = {
  general: "General",
  updates: "Updates",
  "tag-groups": "Groups",
  settings: "Account",
};

export const SettingsToolbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current section name from path
  const section = location.pathname.split("/").pop() || "";
  const sectionName = sectionNames[section];

  const handleDrag = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Only start dragging on left click and not on interactive elements
    if (e.button === 0 && !target.closest("button")) {
      e.preventDefault();
      await getCurrentWindow().startDragging();
    }
  };

  return (
    <div
      className="h-12 flex items-center gap-4 px-2 mt-2 select-none"
    >
    <div
        className="h-12 w-full absolute left-0 top-0 z-0"
        onMouseDown={handleDrag} 
        data-tauri-drag-region
    />
      <div className="flex items-center gap-2 z-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-shade-9 hover:text-white rounded-full border border-white/10 hover:bg-shade-1!"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="size-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-shade-9 hover:text-white rounded-full border border-white/10 hover:bg-shade-1!"
          onClick={() => navigate(1)}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
      <span className="text-md font-medium text-white/80">{sectionName}</span>
    </div>
  );
};
