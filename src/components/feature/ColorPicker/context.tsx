import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { HsvaColor, hsvaToHex } from "@uiw/react-color";

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
  defaultColor?: HsvaColor;
}

export const ColorPickerProvider = ({
  children,
  defaultColor = { h: 0, s: 0, v: 0, a: 1 },
}: ColorPickerProviderProps) => {
  const [hsva, setHsva] = useState<HsvaColor>(defaultColor);

  // Internal state for color wheel
  const [baseColor, setBaseColor] = useState({
    h: defaultColor.h,
    s: defaultColor.s,
  });
  const [brightness, setBrightness] = useState(defaultColor.v);
  const [opacity, setOpacity] = useState(defaultColor.a);

  // Sync internal state when hsva changes externally
  useEffect(() => {
    // Only update base color if brightness is > 0 (to preserve color when dark)
    if (hsva.v > 0) {
      setBaseColor({ h: hsva.h, s: hsva.s });
    }
    setBrightness(hsva.v);
    setOpacity(hsva.a);
  }, [hsva]);

  // Convert to hex for display
  const hexColor = hsvaToHex(hsva);

  const value: ColorPickerContextValue = {
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
    <ColorPickerContext.Provider value={value}>
      {children}
    </ColorPickerContext.Provider>
  );
};
