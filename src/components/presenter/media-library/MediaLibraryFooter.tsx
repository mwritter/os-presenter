import { Button } from "@/components/ui/button";
import { useImportMedia } from "./hooks/use-import-media";
import { Plus } from "lucide-react";

export const MediaLibraryFooter = () => {
  const { isImporting, handleImport } = useImportMedia();

  return (
    <div className="flex w-full h-10 items-center justify-between bg-shade-3 px-2">
      <Button
        className="text-gray-400 rounded-sm hover:text-gray-400 hover:bg-white/10"
        variant="ghost"
        size="icon-xs"
        onClick={handleImport}
        disabled={isImporting}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};
