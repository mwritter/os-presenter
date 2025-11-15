import { Input } from "@/components/ui/input";

export const TextFontSizeInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Input
        className="text-xs! h-min"
        type="number"
        min={1}
        value={Math.max(1, value)}
        onChange={(e) => {
          const number = Number(e.target.value);
          if (number < 1) return;
          onChange(number);
        }}
        onBlur={() => onChange(Math.max(1, value))}
      />
    </div>
  );
};
