import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSelectedLibrary,
  useLibraryStore,
} from "@/stores/presenter/presenterStore";
import { useEffect, useState } from "react";
import { CanvasSize } from "../../../types";
import { AddPresentationForm } from "./AddPresentationForm";

export const AddPresentationDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const selectedLibrary = useSelectedLibrary();
  const addLibrarySlideGroup = useLibraryStore((s) => s.addLibrarySlideGroup);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | undefined>();

  useEffect(() => {
    setSelectedLibraryId(selectedLibrary?.id ?? undefined);
  }, [selectedLibrary]);

  const handleCreate = ({ presentationName, canvasSize }: { presentationName: string; canvasSize: CanvasSize }) => {
    if (!selectedLibraryId || !presentationName) return;
    addLibrarySlideGroup(selectedLibraryId, {
      id: crypto.randomUUID(),
      meta: {
        libraryId: selectedLibraryId,
      },
      title: presentationName,
      slides: [],
      canvasSize,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm! bg-shade-3">
        <DialogHeader>
          <DialogTitle>Add New Presentation</DialogTitle>
        </DialogHeader>
        <DialogDescription>Add presentation to your library.</DialogDescription>
        <AddPresentationForm onSubmit={handleCreate} />
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="add-presentation-form">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
