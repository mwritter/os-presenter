import { Button } from "@/components/ui/button";
import { Shapes, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

export const EditViewObjectActionbar = () => {
  return (
    <div className="absolute top-5 z-10 flex justify-center w-full">
      <div className="flex items-center gap-2 bg-shade-3/45 backdrop-blur-sm rounded-md p-1">
        <EditViewObjectActionbarButton
          icon={<p className="font-bold">T</p>}
          label="Text"
        />
        <EditViewObjectActionbarButton icon={<Shapes />} label="Shape" />
        <EditViewObjectActionbarButton icon={<ImageIcon />} label="Image" />
        <EditViewObjectActionbarButton
          withOutDevider
          icon={<VideoIcon />}
          label="Video"
        />
      </div>
    </div>
  );
};

const EditViewObjectActionbarButton = ({
  icon,
  withOutDevider = false,
}: {
  icon: React.ReactNode;
  label: string;
  withOutDevider?: boolean;
}) => {
  return (
    <>
      <Button variant="ghost" size="sm">
        <div className="px-2">{icon}</div>
      </Button>
      {!withOutDevider && <div className="h-[50%] w-px bg-white/10" />}
    </>
  );
};
