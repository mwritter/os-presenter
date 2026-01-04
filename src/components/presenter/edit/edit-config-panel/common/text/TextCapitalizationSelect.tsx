import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TextCapitalizationSelect = ({
  value,
  onChange,
}: {
  value?: "none" | "uppercase" | "lowercase" | "capitalize";
  onChange: (
    value: "none" | "uppercase" | "lowercase" | "capitalize" | undefined
  ) => void;
}) => {
  return (
    <Select value={value} onValueChange={onChange as (value: string) => void}>
      <SelectTrigger className="w-full text-xs! h-min! py-1">
        <SelectValue placeholder="Select a capitalization" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None</SelectItem>
        <SelectItem value="uppercase">Uppercase</SelectItem>
        <SelectItem value="lowercase">Lowercase</SelectItem>
        <SelectItem value="capitalize">Capitalize</SelectItem>
      </SelectContent>
    </Select>
  );
};
