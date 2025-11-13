import { Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { useEditContext } from "@/presenter/edit/context";
import { AddShapeActionbarButton } from "./AddShapeActionbarButton";
import { EditViewObjectActionbarButton } from "./EditViewObjectActionbarButton";

export const EditViewObjectActionbar = () => {
  const { addTextObject, addImageObject, addVideoObject } = useEditContext();

  // TODO: Open file picker for image and video
  const handleAddImage = () => {
    // For now, add placeholder image - in future, open file picker
    addImageObject("https://via.placeholder.com/400x300");
  };

  const handleAddVideo = () => {
    // For now, add placeholder video - in future, open file picker
    addVideoObject(
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    );
  };

  return (
    <div className="fixed top-19 z-10 flex justify-center w-full pointer-events-none">
      <div className="flex items-center gap-2 bg-shade-3/45 backdrop-blur-sm rounded-md p-1 pointer-events-auto">
        <EditViewObjectActionbarButton
          icon={<p className="font-bold">T</p>}
          label="Text"
          onClick={addTextObject}
        />

        <AddShapeActionbarButton />

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
