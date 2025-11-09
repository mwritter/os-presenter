import { SlideObject } from "@/components/feature/slide/types";
import { cn } from "@/lib/utils";
import { useEditContext } from "@/presenter/edit/context";
import {
  GripVertical,
  ImageIcon,
  Shapes,
  Trash2,
  VideoIcon,
} from "lucide-react";

export const EditViewObjectPanelItem = ({ object }: { object: SlideObject }) => {
  const { selectObject, deleteObject } = useEditContext();

  const getObjectIcon = (type: string) => {
    switch (type) {
      case "text":
        return <span className="text-xs font-bold">T</span>;
      case "shape":
        return <Shapes className="h-3 w-3" />;
      case "image":
        return <ImageIcon className="h-3 w-3" />;
      case "video":
        return <VideoIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getObjectLabel = (obj: any) => {
    if (obj.type === "text") return obj.content.substring(0, 20) || "Text";
    if (obj.type === "shape") return `${obj.shapeType} Shape`;
    if (obj.type === "image") return "Image";
    if (obj.type === "video") return "Video";
    return "Object";
  };

  return (
    <div
      key={object.id}
      className={cn(
        "p-2 border-b border-shade-1 hover:bg-shade-2 transition-all select-none"
      )}
      onClick={() => selectObject(object.id)}
    >
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="text-gray-400 shrink-0 cursor-grab active:cursor-grabbing hover:text-white"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="text-white shrink-0">{getObjectIcon(object.type)}</div>
          <span className="text-white text-xs truncate">
            {getObjectLabel(object)}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
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
