import { MediaLibraryFooter } from "./MediaLibraryFooter";
import { MediaLibraryHeader } from "./MediaLibraryHeader";
import { MediaLibraryContent } from "./MediaLibraryContent";

export const MediaLibrary = () => {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-full w-full">
      <MediaLibraryHeader />
      <MediaLibraryContent />
      <MediaLibraryFooter />
    </div>
  );
};
