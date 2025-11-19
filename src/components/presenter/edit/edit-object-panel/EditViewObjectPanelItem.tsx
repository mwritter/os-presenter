import { SlideObject } from "@/components/feature/slide/types";
import { cn } from "@/lib/utils";
import { useEditContext } from "@/presenter/edit/context";
import { Trash2, Lock, Unlock } from "lucide-react";
import { getObjectIcon } from "../utils/getObjectIcon";
import { getObjectLabel } from "../utils/getObjectLabel";

export const EditViewObjectPanelItem = ({
  object,
}: {
  object: SlideObject;
}) => {
  const { selectObject, deleteObject, toggleObjectLock, selectedObjectId } =
    useEditContext();
  const isSelected = selectedObjectId === object.id;

  return (
    <div
      key={object.id}
      className={cn(
        "p-2 border transition-all bg-shade-3 select-none active:z-10",
        {
          "border-blue-400": isSelected,
        }
      )}
      onClick={() => selectObject(object.id)}
    >
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="text-white shrink-0">
            {getObjectIcon(object.type)}
          </div>
          <span
            className={cn("text-white text-xs truncate select-none", {
              "opacity-50": object.isLocked,
            })}
          >
            {getObjectLabel(object)}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="text-gray-400 hover:text-white p-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleObjectLock(object.id);
            }}
            title={object.isLocked ? "Unlock" : "Lock"}
          >
            {object.isLocked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
          </button>
          <button
            className="text-red-400 hover:text-red-300 p-1"
            onClick={(e) => {
              e.stopPropagation();
              deleteObject(object.id);
            }}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
