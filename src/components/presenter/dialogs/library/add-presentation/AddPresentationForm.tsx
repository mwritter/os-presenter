import { CanvasPreset, CanvasSize } from "@/components/presenter/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANVAS_PRESETS, DEFAULT_CANVAS_PRESET} from "@/consts/canvas";
import { useLibraryStore, useSelectedLibrary } from "@/stores/presenter/presenterStore";
import { useState } from "react";

interface AddPresentationFormProps {
  onSubmit: ({ presentationName, canvasSize }: { presentationName: string; canvasSize: CanvasSize }) => void;
}

export const AddPresentationForm = ({ onSubmit }: AddPresentationFormProps) => {
  const [presentationName, setPresentationName] = useState<string>("");
  const [canvasPreset, setCanvasPreset] = useState<CanvasPreset>(DEFAULT_CANVAS_PRESET);
  const libraries = useLibraryStore((s) => s.libraries);
  const selectedLibrary = useSelectedLibrary();
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | undefined>(selectedLibrary?.id ?? undefined);

  const handleCanvasSizeChange = (value: string) => {
    const preset = CANVAS_PRESETS.find(({id}) => id === value);
    if (preset) setCanvasPreset(preset);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ presentationName, canvasSize: canvasPreset.value });
  };

  return (
    <form id="add-presentation-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Presentation Name</p>
        <Input
        required
          value={presentationName}
          onChange={(e) => setPresentationName(e.target.value)}
          type="text"
          placeholder="Enter presentation name"
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Library</p>
        <Select value={selectedLibraryId} onValueChange={(value) => setSelectedLibraryId(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a library" />
          </SelectTrigger>
          <SelectContent>
            {libraries.map((library) => (
              <SelectItem key={library.id} value={library.id}>
                {library.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Canvas Size</p>
        <Select
          required
          value={canvasPreset.id}
          onValueChange={handleCanvasSizeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select canvas size" />
          </SelectTrigger>
          <SelectContent>
            {CANVAS_PRESETS.map((preset) => (
              <SelectItem
                key={preset.label}
                value={preset.id}
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
    </form>
  );
};
