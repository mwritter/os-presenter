import { createContext, ReactNode, useContext, useState } from "react";

interface ItemPanelContextType {
  filter: string;
  setFilter: (filter: string) => void;
}

const ItemPanelContext = createContext<ItemPanelContextType | undefined>(
  undefined
);

export const ItemPanelProvider = ({ children }: { children: ReactNode }) => {
  const [filter, setFilter] = useState<string>("");

  return (
    <ItemPanelContext.Provider value={{ filter, setFilter }}>
      {children}
    </ItemPanelContext.Provider>
  );
};

export const useItemPanelContext = () => {
  const context = useContext(ItemPanelContext);
  if (context === undefined) {
    throw new Error(
      "useItemPanelContext must be used within a ItemPanelProvider"
    );
  }
  return context;
};
