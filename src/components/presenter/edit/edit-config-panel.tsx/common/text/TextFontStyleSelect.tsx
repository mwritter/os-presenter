import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

// TODO: figure out how to get font style with tauri
const fontStyles = [
  {
    value: "normal",
    label: "Normal",
  },
  {
    value: "italic",
    label: "Italic",
  },
  {
    value: "oblique",
    label: "Oblique",
  },
];

export const TextFontStyle = () => {
  const [fontStyle, setFontStyle] = useState("normal");
  return (
    <Select value={fontStyle} onValueChange={setFontStyle}>
      <SelectTrigger className="w-full text-xs! h-min! py-1">
        <div style={{ fontStyle }}>
          <SelectValue placeholder="Select a font style" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {fontStyles.map((fontStyle) => (
          <SelectItem key={fontStyle.value} value={fontStyle.value}>
            {fontStyle.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
