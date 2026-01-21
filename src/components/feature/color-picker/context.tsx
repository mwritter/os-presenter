import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { HsvaColor } from "@uiw/react-color";
import { hsvaToRgba, rgbaToHsva } from "./utils/colorConversions";

interface ColorPickerContextValue {
  // Computed color (derived from baseColor + brightness + opacity)
  hsva: HsvaColor;
  rgbaColor: string;

  // Source of truth - these are what actually get modified
  baseColor: { h: number; s: number };
  brightness: number;
  opacity: number;
  setBaseColor: (baseColor: { h: number; s: number }) => void;
  setBrightness: (brightness: number) => void;
  setOpacity: (opacity: number) => void;

  // Helper to set full color at once (for swatches)
  setFullColor: (hsva: HsvaColor) => void;
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
  value?: string; // rgba color value from parent
  onChange?: (color: string) => void; // returns rgba format
}

export const ColorPickerProvider = ({
  children,
  value: externalValue,
  onChange,
}: ColorPickerProviderProps) => {
  // Parse initial value once - this is our starting point
  const [initialValue] = useState(() =>
    externalValue ? rgbaToHsva(externalValue) : { h: 0, s: 0, v: 100, a: 1 }
  );

  // SOURCE OF TRUTH: These three pieces compose the full color
  // No syncing from external - we own this state after mount
  const [baseColor, setBaseColor] = useState({
    h: initialValue.h,
    s: initialValue.s,
  });
  const [brightness, setBrightness] = useState(initialValue.v);
  const [opacity, setOpacity] = useState(initialValue.a);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Store onChange in ref to avoid stale closures in debounce
  // const onChangeRef = useRef(onChange);
  // onChangeRef.current = onChange;

  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DERIVED: hsva is computed from the source of truth
  const hsva = useMemo<HsvaColor>(
    () => ({ h: baseColor.h, s: baseColor.s, v: brightness, a: opacity }),
    [baseColor.h, baseColor.s, brightness, opacity]
  );

  // DERIVED: rgba string for display/output
  const rgbaColor = useMemo(() => hsvaToRgba(hsva), [hsva]);

  // Notify parent of changes (skip initial mount, debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce onChange calls (16ms ≈ 1 frame)
    debounceTimer.current = setTimeout(() => {
      onChange?.(rgbaColor);
    }, 16);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [rgbaColor]);

  // Helper to set full color at once (for swatches)
  const setFullColor = (hsva: HsvaColor) => {
    setBaseColor({ h: hsva.h, s: hsva.s });
    setBrightness(hsva.v);
    setOpacity(hsva.a);
  };

  const contextValue: ColorPickerContextValue = {
    hsva,
    rgbaColor,
    baseColor,
    brightness,
    opacity,
    setBaseColor,
    setBrightness,
    setOpacity,
    setFullColor,
  };

  return (
    <ColorPickerContext.Provider value={contextValue}>
      {children}
    </ColorPickerContext.Provider>
  );
};
