import { SlideData } from "@/components/feature/slide/types";
import { createContext, useContext, useState } from "react";

interface EditContextType {
  selectedSlide: SlideData | null;
  setSelectedSlide: (slide: SlideData) => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export const EditProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedSlide, setSelectedSlide] = useState<SlideData | null>(null);

  return <EditContext.Provider value={{ selectedSlide, setSelectedSlide }}>{children}</EditContext.Provider>;
};

export const useEditContext = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEditContext must be used within an EditProvider');
  }
  return context;
};