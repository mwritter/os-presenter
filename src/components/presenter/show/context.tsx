import { createContext, useContext, useState } from "react";

export const MAX_GRID_COLUMNS = 8;
export const MIN_GRID_COLUMNS = 2;

export type ShowViewContextType = {
  gridColumns: number;
  setGridColumns: (columns: number) => void;
};

export const ShowViewContext = createContext<ShowViewContextType>({
  gridColumns: MAX_GRID_COLUMNS,
  setGridColumns: () => {},
});

export const ShowViewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [gridColumns, setGridColumns] = useState(4);

  return (
    <ShowViewContext value={{ gridColumns, setGridColumns }}>
      {children}
    </ShowViewContext>
  );
};
export const useShowViewContext = () => {
  return useContext(ShowViewContext);
};
