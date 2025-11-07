import { useEffect, useRef, useState } from "react";
import { InputValue } from "./types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
    const [value, setValue] = useState<InputValue>({
      mode: "view",
      text: name,
    });
    const itemInputRef = useRef<HTMLInputElement>(null);
  
    const handleDelete = () => {
      onDelete(id);
    };
  
    const handleRename = () => {
      setValue({ ...value, mode: "edit" });
    };
  
    useEffect(() => {
      if (value.mode === "edit") {
        requestAnimationFrame(() => {
          itemInputRef.current?.focus();
        });
      }
    }, [value.mode]);
  
    useEffect(() => {
      if (value.mode === "view" && value.text !== name) {
        onUpdate(id, { name: value.text });
      }
    }, [value.text, value.mode]);
  
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            onClick={() => onSelect(id)}
            className={`flex items-center gap-2 py-1 p-5 w-full ${
              isSelected ? "bg-white/20" : "hover:bg-white/20"
            }`}
          >
            {icon}
            <div className="flex-1 text-left text-white text-xs whitespace-nowrap text-ellipsis overflow-hidden">
              {value.mode === "edit" ? (
                <input
                  ref={itemInputRef}
                  className="border w-full bg-black"
                  type="text"
                  value={value.text}
                  onChange={(e) => setValue({ ...value, text: e.target.value })}
                  onBlur={() => setValue({ ...value, mode: "view" })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setValue({ ...value, mode: "view" });
                    }
                    if (e.key === "Escape") {
                      setValue({ text: name, mode: "view" });
                    }
                  }}
                />
              ) : (
                value.text
              )}
            </div>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
          <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };