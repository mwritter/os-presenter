import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shapes, Image as ImageIcon, Video as VideoIcon, Square, Circle } from "lucide-react";
import { useEditContext } from "@/presenter/edit/context";

export const EditViewObjectActionbar = () => {
  const { addTextObject, addShapeObject, addImageObject, addVideoObject } = useEditContext();

  const handleAddImage = () => {
    // For now, add placeholder image - in future, open file picker
    addImageObject('https://via.placeholder.com/400x300');
  };

  const handleAddVideo = () => {
    // For now, add placeholder video - in future, open file picker
    addVideoObject('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  };

  return (
    <div className="absolute top-5 z-10 flex justify-center w-full pointer-events-none">
      <div className="flex items-center gap-2 bg-shade-3/45 backdrop-blur-sm rounded-md p-1 pointer-events-auto">
        <EditViewObjectActionbarButton
          icon={<p className="font-bold">T</p>}
          label="Text"
          onClick={addTextObject}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <div className="px-2">
                <Shapes />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addShapeObject('rectangle')}>
              <Square className="mr-2 h-4 w-4" />
              Rectangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShapeObject('circle')}>
              <Circle className="mr-2 h-4 w-4" />
              Circle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShapeObject('triangle')}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2 L22 22 L2 22 Z" />
              </svg>
              Triangle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="h-[50%] w-px bg-white/10" />
        
        <EditViewObjectActionbarButton
          icon={<ImageIcon />}
          label="Image"
          onClick={handleAddImage}
        />
        <EditViewObjectActionbarButton
          withOutDevider
          icon={<VideoIcon />}
          label="Video"
          onClick={handleAddVideo}
        />
      </div>
    </div>
  );
};

const EditViewObjectActionbarButton = ({
  icon,
  withOutDevider = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  withOutDevider?: boolean;
  onClick?: () => void;
}) => {
  return (
    <>
      <Button variant="ghost" size="sm" onClick={onClick}>
        <div className="px-2">{icon}</div>
      </Button>
      {!withOutDevider && <div className="h-[50%] w-px bg-white/10" />}
    </>
  );
};
