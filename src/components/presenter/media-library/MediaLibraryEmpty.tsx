import { IconButton } from "@/components/feature/icon-button/IconButton";
import { ArrowDown, Loader2 } from "lucide-react";
import { useImportMedia } from "./hooks/use-import-media";

export const MediaLibraryEmpty = () => {
  const { isImporting, handleImport } = useImportMedia();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <IconButton
        className="bg-white/10 hover:bg-white/20 text-white"
        label={isImporting ? "Importing..." : "Import Media"}
        Icon={isImporting ? Loader2 : ArrowDown}
        size="lg"
        onClick={handleImport}
        disabled={isImporting}
      />
    </div>
  );
};
