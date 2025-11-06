import { createContext, useContext, ReactNode, useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

interface MediaLibraryContextType {
  toggle: () => void;
  panelRef: React.RefObject<ImperativePanelHandle | null>;
  handlePanelRef: (ref: ImperativePanelHandle | null) => void;
  }

const MediaLibraryContext = createContext<MediaLibraryContextType | undefined>(undefined);

export const MediaLibraryProvider = ({ children }: { children: ReactNode }) => {
  const panelRef = useRef<ImperativePanelHandle>(null)

  const toggle = () => {
    if (panelRef.current) {
      const isCollapsed = panelRef.current.isCollapsed();
      if (isCollapsed)
        panelRef.current.expand();
      else
        panelRef.current.collapse();
    }
  };

  const handlePanelRef = (ref: ImperativePanelHandle | null) => {
    panelRef.current = ref;
  }

  return (
    <MediaLibraryContext.Provider value={{toggle, panelRef, handlePanelRef }}>
      {children}
    </MediaLibraryContext.Provider>
  );
};

export const useMediaLibraryContext = () => {
  const context = useContext(MediaLibraryContext);
  if (context === undefined) {
    throw new Error("useMediaLibraryContext must be used within a MediaLibraryProvider");
  }
  return context;
};

