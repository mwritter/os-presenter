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

// TODO: Add input for the slide group title and call the addLibrarySlideGroup function when the user clicks the add button
export const AddPresentationDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [presentationName, setPresentationName] = useState("");
  const selectedLibrary = usePresenterStore(selectSelectedLibrary);
  const addLibrarySlideGroup = usePresenterStore((state) => state.addLibrarySlideGroup);
  const libraries = usePresenterStore(selectLibraries) ?? [];
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | undefined>();
  
  useEffect(() => {
    setSelectedLibraryId(selectedLibrary?.id ?? undefined);
  }, [selectedLibrary]);

  const handleCreate = () => {
    if (!selectedLibraryId) return;
    addLibrarySlideGroup(selectedLibraryId, {
      id: crypto.randomUUID(),
      title: presentationName,
      slides: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Presentation</DialogTitle>
        </DialogHeader>
        <DialogDescription>Add presentation to your library.</DialogDescription>
        <Input
          value={presentationName}
          onChange={(e) => setPresentationName(e.target.value)}
          type="text"
          placeholder="Enter presentation name"
        />
        <Select value={selectedLibraryId} onValueChange={(value) => setSelectedLibraryId(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a library" />
          </SelectTrigger>
          <SelectContent>
            {libraries.map((library) => (
              <SelectItem key={library.id} value={library.id}>{library.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={presentationName.trim().length === 0}
            onClick={handleCreate}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
