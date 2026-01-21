import { IconButton } from "@/components/feature/icon-button/IconButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useLibraryStore,
  usePlaylistStore,
  usePresenterStore,
  useSelectionStore,
} from "@/stores/presenter/presenterStore";
import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { SlideGroup } from "../../types";
import { Button } from "@/components/ui/button";
import { EnterKey, ModifierKey } from "@/components/feature/kbd/Kbd";
import { SearchItem } from "./SearchItem";
import { useSearchNavigation } from "./hooks/use-search-navigation";

export const Search = () => {
  const libraries = useLibraryStore((s) => s.libraries);
  const selectSlideGroup = usePresenterStore((s) => s.selectSlideGroup);
  const addSlideGroupToPlaylist = usePlaylistStore(
    (s) => s.addSlideGroupToPlaylist
  );
  const selectLibrary = usePresenterStore((s) => s.selectLibrary);
  const selectedPlaylistId = useSelectionStore((s) => s.selectedPlaylistId);
  const [selectedSlideGroup, setSelectedSlideGroup] =
    useState<SlideGroup | null>(null);
  const [searchResults, setSearchResults] = useState<SlideGroup[]>(
    libraries.flatMap((library) => library.slideGroups)
  );
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { selectedIndex, onKeyDown, resetSelectedIndex, setSelectedIndex } =
    useSearchNavigation({
      itemsLength: searchResults.length,
    });
  // prevent window drag due to toolbar handle drag logic
  const stopDragPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const getLibraryName = (libraryId?: string) => {
    if (!libraryId) return undefined;
    return libraries.find((library) => library.id === libraryId)?.name;
  };

  const resetState = () => {
    resetSelectedIndex();
    setSelectedSlideGroup(null);
    setInputValue("");
    setDebouncedQuery("");
  };

  const handleClose = () => {
    setIsOpen(false);
    // Delay state reset until after close animation (200ms)
    setTimeout(resetState, 200);
  };

  const handleOpenSlideGroup = (
    slideGroup: SlideGroup | null,
    e: React.KeyboardEvent
  ) => {
    e.preventDefault();
    if (!slideGroup || !slideGroup.meta?.libraryId) return;
    selectLibrary(slideGroup.meta?.libraryId);
    selectSlideGroup(slideGroup.id, slideGroup.meta?.libraryId);
    handleClose();
  };

  const handleAddToSelectedPlaylist = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (
      !selectedPlaylistId ||
      !selectedSlideGroup ||
      !selectedSlideGroup.meta?.libraryId
    )
      return;
    addSlideGroupToPlaylist(
      selectedPlaylistId,
      selectedSlideGroup.meta?.libraryId,
      selectedSlideGroup.id
    );
    handleClose();
  };

  const getEmptySearchItems = () => {
    const length = searchResults.length;
    const left = 15 - length;

    return left > 0
      ? Array.from({ length: left }).map((_, index) => (
          <SearchItem key={index} />
        ))
      : [];
  };

  // Update selected slide group when selected index changes
  useEffect(() => {
    if (selectedIndex !== null) {
      setSelectedSlideGroup(() => searchResults[selectedIndex] ?? null);
    }
  }, [selectedSlideGroup, searchResults, selectedIndex]);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Update search results when debounced query changes
  useEffect(() => {
    const results = libraries
      .flatMap((library) => library.slideGroups)
      .filter((slideGroup) =>
        slideGroup.title.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    setSearchResults(results);
  }, [debouncedQuery, libraries]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          setIsOpen(true);
        } else {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <IconButton Icon={SearchIcon} label="Search" />
      </DialogTrigger>
      <DialogContent
        className="max-w-xs! bg-shade-lighter/50 backdrop-blur-xl p-0! gap-0! overflow-hidden focus:outline-none drop-shadow-xl"
        onMouseDown={stopDragPropagation}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) {
            handleAddToSelectedPlaylist(e);
          } else if (e.key === "Enter") {
            handleOpenSlideGroup(selectedSlideGroup, e);
          } else {
            onKeyDown(e);
          }
        }}
      >
        <div className="p-4 flex flex-col gap-2">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-xs">
            Search for a presentation
          </DialogDescription>
        </div>
        <div className="mb-2 flex w-full items-center px-2">
          <SearchIcon className="size-4" />
          <Input
            className="peer border-none rounded-none bg-transparent! focus-visible:ring-0 focus-visible:ring-offset-0"
            type="text"
            placeholder="Library"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-form-type="other"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button
            className="peer-placeholder-shown:hidden rounded-full "
            variant="outline"
            size="icon-xs"
            onClick={() => setInputValue("")}
          >
            <XIcon className="size-2" />
          </Button>
        </div>
        <div className="flex flex-col gap-2 h-[400px] overflow-y-auto flex-1">
          <ul className="flex flex-col">
            {searchResults.map((slideGroup, index) => (
              <SearchItem
                key={slideGroup.id}
                title={slideGroup.title}
                library={getLibraryName(slideGroup.meta?.libraryId)}
                isSelected={selectedSlideGroup?.id === slideGroup.id}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
            {getEmptySearchItems().map((_, index) => (
              <SearchItem key={index} />
            ))}
          </ul>
        </div>
        <div className="p-2 text-xs text-muted-foreground flex justify-center items-center gap-4 border-t border-white/10">
          <div className="flex items-center gap-1">
            <ModifierKey />
            <EnterKey />
            <span>Add to playlist</span>
          </div>
          <div className="flex items-center gap-1">
            <EnterKey />
            <span>Open</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
