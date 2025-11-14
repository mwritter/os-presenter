import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// TODO: figure out how to get system fonts with
// tauri-plugin-system-fonts looks promising https://github.com/ayangweb/tauri-plugin-system-fonts
const fontFamilies = [
  {
    value: "sans-serif",
    label: "Sans Serif",
  },
  {
    value: "serif",
    label: "Serif",
  },
  {
    value: "monospace",
    label: "Monospace",
  },
  {
    value: "display",
    label: "Display",
  },
  {
    value: "handwriting",
    label: "Handwriting",
  },
];

export function TextFontFamilyCombobox() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          style={{ fontFamily: value }}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-xs! h-min! py-1"
        >
          {value
            ? fontFamilies.find((fontFamily) => fontFamily.value === value)
                ?.label
            : "Select font family..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search font family..." className="h-9" />
          <CommandList>
            <CommandEmpty>No font family found.</CommandEmpty>
            <CommandGroup>
              {fontFamilies.map((fontFamily) => (
                <CommandItem
                  style={{ fontFamily: fontFamily.value }}
                  key={fontFamily.value}
                  value={fontFamily.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {fontFamily.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === fontFamily.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
