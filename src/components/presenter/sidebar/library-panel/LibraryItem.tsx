import { Library } from "lucide-react";
import { usePresenterStore, selectSelectedLibraryId } from "@/stores/presenterStore";

type LibraryItemProps = {
  id: string;
  name: string;
};

export const LibraryItem = ({ id, name }: LibraryItemProps) => {
  const selectedLibraryId = usePresenterStore(selectSelectedLibraryId);
  const selectLibrary = usePresenterStore((state) => state.selectLibrary);
  const isSelected = selectedLibraryId === id;

  return (
    <button
      onClick={() => selectLibrary(id)}
      className={`flex items-center gap-2 py-1 pl-5 hover:bg-white/10 w-full ${
        isSelected ? "bg-white/20" : ""
      }`}
    >
      <div className="bg-orange-400 rounded-xs p-[2px]">
        <Library className="size-3.5" color="white" />
      </div>
      <div className="text-white text-xs whitespace-nowrap" key={id}>
        {name}
      </div>
    </button>
  );
};
