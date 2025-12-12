import { useEffect, useState } from "react";
import { InputValue } from "../types";

export const useRenameState = ({
  id,
  name,
  itemInputRef,
  onUpdate,
}: {
  id: string;
  name: string;
  itemInputRef: React.RefObject<HTMLInputElement | null>;
  onUpdate: (id: string, { name }: { name: string }) => void;
}) => {
  const [renameState, setRenameState] = useState<InputValue>({
    mode: "view",
    text: name,
  });

  const onBlur = () => {
    setRenameState({ ...renameState, mode: "view" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setRenameState({ ...renameState, mode: "view" });
    }
    if (e.key === "Escape") {
      setRenameState({ text: name, mode: "view" });
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRenameState({ ...renameState, text: e.target.value });
  };

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

  return { renameState, setRenameState, onBlur, onKeyDown, onChange };
};
