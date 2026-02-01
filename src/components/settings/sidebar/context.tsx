import { createContext, ReactNode, useContext, useState } from "react";

interface SettingsSidebarContextType {
  searchTerm: string | undefined;
  setSearchTerm: (searchTerm: string) => void;
}

const SettingsSidebarContext = createContext<SettingsSidebarContextType>({} as SettingsSidebarContextType);

export const SettingsSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState<string>();
  return <SettingsSidebarContext value={{ searchTerm, setSearchTerm }}>{children}</SettingsSidebarContext>;
};

export const useSettingsSidebar = () => useContext(SettingsSidebarContext);