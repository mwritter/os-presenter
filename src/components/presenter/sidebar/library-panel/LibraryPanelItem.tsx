import { useEffect, useRef, useState } from "react";
import { useContextMenu } from "./hooks/use-context-menu";
import { InputValue } from "./types";

type LibraryPanelItemProps = {
  id: string;
  name: string;
  icon: React.ReactNode;
  onUpdate: (id: string, { name }: { name: string }) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
  isSelected: boolean;
};

export const LibraryPanelItem = ({
  id,
  name,
  icon,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
}: LibraryPanelItemProps) => {
  const [renameState, setRenameState] = useState<InputValue>({
    mode: "view",
    text: name,
  });
  const itemInputRef = useRef<HTMLInputElement>(null);
  const { openContextMenu } = useContextMenu({
    onDelete,
    onRename: () => setRenameState({ mode: "edit", text: name }),
    id,
  });

  useEffect(() => {
    if (renameState.mode === "edit") {
      requestAnimationFrame(() => {
        itemInputRef.current?.focus();
      });
    }
  }, [renameState.mode]);

  useEffect(() => {
    if (renameState.mode === "view" && renameState.text !== name) {
      onUpdate(id, { name: renameState.text });
    }
  }, [renameState.text, renameState.mode]);

  return (
    <button
      onClick={() => onSelect(id)}
      onContextMenu={(e) => openContextMenu(e)}
      className={`flex items-center gap-2 py-1 p-5 w-full ${
        isSelected ? "bg-white/20" : "hover:bg-white/20"
      }`}
    >
      {icon}
      <div className="flex-1 text-left text-white text-xs whitespace-nowrap text-ellipsis overflow-hidden">
        {renameState.mode === "edit" ? (
          <input
            ref={itemInputRef}
            className="border w-full bg-black"
            type="text"
            value={renameState.text}
            onChange={(e) =>
              setRenameState({ ...renameState, text: e.target.value })
            }
            onBlur={() => setRenameState({ ...renameState, mode: "view" })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setRenameState({ ...renameState, mode: "view" });
              }
              if (e.key === "Escape") {
                setRenameState({ text: name, mode: "view" });
              }
            }}
          />
        ) : (
          renameState.text
        )}
      </div>
    </button>
  );
};
