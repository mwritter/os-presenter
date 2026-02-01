import { SearchIcon, XCircle, XCircleIcon, XIcon } from "lucide-react";
import { useSettingsSidebar } from "./context";
import { Button } from "@/components/ui/button";

export const SettingsSidebarSearch = () => {
  const { searchTerm, setSearchTerm } = useSettingsSidebar()
  return <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1.5 mb-2">
    <SearchIcon className="size-3 text-white/50 shrink-0" />
    <input
      type="text"
      placeholder="Search"
      autoComplete="off"
      autoCorrect="off"
      className="peer w-full text-xs outline-none"
      value={searchTerm ?? ""}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <Button
      size="icon-xs"
      className="peer-placeholder-shown:hidden rounded-full size-3 bg-white/50 text-shade-1"
      onClick={() => setSearchTerm("")}
    >
      <XIcon className="size-2" />
    </Button>
  </div>;
};