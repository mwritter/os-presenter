import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { HsvaColor, hsvaToHex, hexToHsva } from "@uiw/react-color";

interface ColorPickerContextValue {
  // Main color state
  hsva: HsvaColor;
  hexColor: string;
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
  value?: string; // hex color value from parent
  onChange?: (color: string) => void;
}

export const ColorPickerProvider = ({
  children,
  value: externalValue,
  onChange,
}: ColorPickerProviderProps) => {
  // Initialize from external value or default
  const initialHsva = externalValue
    ? hexToHsva(externalValue)
    : { h: 0, s: 0, v: 0, a: 1 };
  
  const [hsva, setHsva] = useState<HsvaColor>(initialHsva);

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
      const newHsva = hexToHsva(externalValue);
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
  }, [hsva]);

  // Notify parent of changes (separate effect to avoid dependency issues)
  useEffect(() => {
    if (onChange) {
      const newHexColor = hsvaToHex(hsva);
      onChange(newHexColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hsva]);

  // Convert to hex for display
  const hexColor = hsvaToHex(hsva);

  const contextValue: ColorPickerContextValue = {
    hsva,
    hexColor,
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
