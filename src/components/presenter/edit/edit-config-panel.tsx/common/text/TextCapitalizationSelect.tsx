import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const TextCapitalizationSelect = () => {
  const [capitalization, setCapitalization] = useState<string>();
  return (
    <Select value={capitalization} onValueChange={setCapitalization}>
      <SelectTrigger className="w-full text-xs! h-min! py-1">
        <SelectValue placeholder="Select a capitalization" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all-caps">All Caps</SelectItem>
        <SelectItem value="title-case">Title Case</SelectItem>
        <SelectItem value="start-case">Start Case</SelectItem>
      </SelectContent>
    </Select>
  );
};
