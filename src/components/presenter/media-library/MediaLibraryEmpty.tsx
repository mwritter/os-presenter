import { IconButton } from "@/components/feature/icon-button/IconButton";
import { Plus } from "lucide-react";
import { useImportMedia } from "./hooks/use-import-media";

export const MediaLibraryEmpty = () => {
  const { isImporting, handleImport } = useImportMedia();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <IconButton
        className="bg-white/10 hover:bg-white/20! text-white"
        label={isImporting ? "Importing..." : "Import Media"}
        Icon={Plus}
        size="icon-xl"
        onClick={handleImport}
        disabled={isImporting}
      />
    </div>
  );
};
