import { ImageIcon, Shapes, VideoIcon } from "lucide-react";

export const getObjectIcon = (type: string): React.ReactNode => {
  switch (type) {
    case "text":
      return <div className="font-bold text-md -mt-1">T</div>;
    case "shape":
      return <Shapes className="h-3 w-3" />;
    case "image":
      return <ImageIcon className="h-3 w-3" />;
    case "video":
      return <VideoIcon className="h-3 w-3" />;
  }
};
