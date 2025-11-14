import { Input } from "@/components/ui/input";
import { useState } from "react";

export const TextFontSizeInput = () => {
  const [fontSize, setFontSize] = useState(16);
  return (
    <div className="flex flex-col gap-2">
      <Input
        className="text-xs! h-min"
        type="number"
        min={1}
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        onBlur={() => setFontSize(Math.max(1, fontSize))}
      />
    </div>
  );
};
