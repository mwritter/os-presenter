import { createContext, useContext, ReactNode, useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

interface SidebarContextType {
  toggle: () => void;
  handlePanelRef: (ref: ImperativePanelHandle | null) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const panelRef = useRef<ImperativePanelHandle>(null);

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
  };

  return (
    <SidebarContext.Provider value={{ toggle, handlePanelRef }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
};

