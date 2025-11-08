import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  selectLibraries,
  selectSelectedLibrary,
  usePresenterStore,
} from "@/stores/presenterStore";
import { useEffect, useState } from "react";
import { CanvasSize } from "../../types";

const CANVAS_PRESETS: { label: string; value: CanvasSize }[] = [
  { label: "HD (1280 x 720)", value: { width: 1280, height: 720 } },
  { label: "Full HD (1920 x 1080)", value: { width: 1920, height: 1080 } },
  { label: "4K (3840 x 2160)", value: { width: 3840, height: 2160 } },
  { label: "4:3 (1024 x 768)", value: { width: 1024, height: 768 } },
];

const DEFAULT_CANVAS_SIZE = CANVAS_PRESETS[1].value; // Full HD

// TODO: Add input for the slide group title and call the addLibrarySlideGroup function when the user clicks the add button
export const AddPresentationDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [presentationName, setPresentationName] = useState<string>("");
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(DEFAULT_CANVAS_SIZE);
  const selectedLibrary = usePresenterStore(selectSelectedLibrary);
  const addLibrarySlideGroup = usePresenterStore((state) => state.addLibrarySlideGroup);
  const libraries = usePresenterStore(selectLibraries) ?? [];
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | undefined>();
  const isDisabled = presentationName.trim().length === 0 || !selectedLibraryId;
  useEffect(() => {
    setSelectedLibraryId(selectedLibrary?.id ?? undefined);
  }, [selectedLibrary]);

  const handleOpenChange = (open: boolean) => {
    setPresentationName("");
    setCanvasSize(DEFAULT_CANVAS_SIZE);
    onOpenChange(open);
  };

  const handleCreate = () => {
    if (!selectedLibraryId || !presentationName) return;
    addLibrarySlideGroup(selectedLibraryId, {
      meta: {
        libraryId: selectedLibraryId,
      },
      title: presentationName,
      slides: [],
      canvasSize,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    handleOpenChange(false);
  };

  const handleCanvasSizeChange = (value: string) => {
    const preset = CANVAS_PRESETS.find(p => `${p.value.width}x${p.value.height}` === value);
    if (preset) {
      setCanvasSize(preset.value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Presentation</DialogTitle>
        </DialogHeader>
        <DialogDescription>Add presentation to your library.</DialogDescription>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Presentation Name</p>
            <Input
              value={presentationName}
              onChange={(e) => setPresentationName(e.target.value)}
              type="text"
              placeholder="Enter presentation name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Library</p>
            <Select onValueChange={(value) => setSelectedLibraryId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a library" />
              </SelectTrigger>
              <SelectContent>
                {libraries.map((library) => (
                  <SelectItem key={library.id} value={library.id}>{library.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Canvas Size</p>
            <Select 
              defaultValue={`${DEFAULT_CANVAS_SIZE.width}x${DEFAULT_CANVAS_SIZE.height}`}
              onValueChange={handleCanvasSizeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select canvas size" />
              </SelectTrigger>
              <SelectContent>
                {CANVAS_PRESETS.map((preset) => (
                  <SelectItem 
                    key={`${preset.value.width}x${preset.value.height}`} 
                    value={`${preset.value.width}x${preset.value.height}`}
                  >
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose the resolution for your presentation display
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={isDisabled}
            onClick={handleCreate}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
