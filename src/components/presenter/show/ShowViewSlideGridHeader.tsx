import { File } from "lucide-react";

export type ShowViewSlideGridHeaderProps = {
  title: string;
};

export const ShowViewSlideGridHeader = ({
  title,
}: ShowViewSlideGridHeaderProps) => {
  return (
    <div className="flex justify-between items-center text-xs p-2 text-white bg-shade-4 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <File className="size-3.5" />
        {title}
      </div>
    </div>
  );
};
