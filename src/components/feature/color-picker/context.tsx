import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { HsvaColor } from "@uiw/react-color";
import { hsvaToRgba, rgbaToHsva } from "./utils/colorConversions";

interface ColorPickerContextValue {
  // Main color state
  hsva: HsvaColor;
  rgbaColor: string;
  setHsva: (hsva: HsvaColor) => void;

  // Internal color wheel state (for independent brightness/opacity control)
  baseColor: { h: number; s: number };
  brightness: number;
  opacity: number;
  setBaseColor: (baseColor: { h: number; s: number }) => void;
  setBrightness: (brightness: number) => void;
  setOpacity: (opacity: number) => void;
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(
  undefined
);

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext);
  if (!context) {
    throw new Error("useColorPicker must be used within a ColorPickerProvider");
  }
  return context;
};

interface ColorPickerProviderProps {
  children: ReactNode;
  value?: string; // rgba color value from parent (also supports hex for backward compatibility)
  onChange?: (color: string) => void; // returns rgba format
}

export const ColorPickerProvider = ({
  children,
  value: externalValue,
  onChange,
}: ColorPickerProviderProps) => {
  // Initialize from external value or default
  const initialHsva = externalValue
    ? rgbaToHsva(externalValue)
    : { h: 0, s: 0, v: 0, a: 1 };

  const [hsva, setHsva] = useState<HsvaColor>(initialHsva);

  // Track if the change is from external source to prevent infinite loops
  const isExternalChange = useRef(false);

  // Internal state for color wheel
  const [baseColor, setBaseColor] = useState({
    h: initialHsva.h,
    s: initialHsva.s,
  });
  const [brightness, setBrightness] = useState(initialHsva.v);
  const [opacity, setOpacity] = useState(initialHsva.a);

  // Sync with external value changes
  useEffect(() => {
    if (externalValue) {
      const newHsva = rgbaToHsva(externalValue);
      isExternalChange.current = true;
      setHsva(newHsva);
    }
  }, [externalValue]);

  // Sync internal state when hsva changes
  useEffect(() => {
    // Only update base color if brightness is > 0 (to preserve color when dark)
    if (hsva.v > 0) {
      setBaseColor({ h: hsva.h, s: hsva.s });
    }
    setBrightness(hsva.v);
    setOpacity(hsva.a);

    // Reset the external change flag after syncing internal state
    if (isExternalChange.current) {
      isExternalChange.current = false;
    }
  }, [hsva]);

  // Notify parent of changes (only for internal changes)
  useEffect(() => {
    if (onChange && !isExternalChange.current) {
      const newRgbaColor = hsvaToRgba(hsva);
      onChange(newRgbaColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hsva]);

  // Convert to rgba for display
  const rgbaColor = hsvaToRgba(hsva);

  const contextValue: ColorPickerContextValue = {
    hsva,
    rgbaColor,
    setHsva,
    baseColor,
    brightness,
    opacity,
    setBaseColor,
    setBrightness,
    setOpacity,
  };

  return (
    <ColorPickerContext.Provider value={contextValue}>
      {children}
    </ColorPickerContext.Provider>
  );
};
