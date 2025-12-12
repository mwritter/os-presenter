import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useSystemFonts } from "@/hooks/use-system-fonts";

export function TextFontFamilyCombobox({
  value: externalValue,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(externalValue || "");
  const { fontNames, isLoading } = useSystemFonts();

  const fontFamilies = fontNames.map((name) => ({
    value: name,
    label: name,
  }));

  // Sync local state with external value
  useEffect(() => {
    setValue(externalValue || "");
  }, [externalValue]);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            style={{ fontFamily: value }}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-xs! h-min! py-1"
            disabled={isLoading}
          >
            {isLoading
              ? "Loading fonts..."
              : value
                ? fontFamilies.find((fontFamily) => fontFamily.value === value)
                    ?.label
                : "Select font family..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 bg-shade-1/50 backdrop-blur-md">
          <Command className="bg-shade-1/10 backdrop-blur-md">
            <CommandInput placeholder="Search font family..." className="h-9" />
            <CommandList className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <CommandEmpty>No font family found.</CommandEmpty>
              <CommandGroup>
                {fontFamilies.map((fontFamily) => (
                  <CommandItem
                    style={{ fontFamily: fontFamily.value }}
                    key={fontFamily.value}
                    value={fontFamily.value}
                    onSelect={(currentValue) => {
                      const newValue =
                        currentValue === value ? "" : currentValue;
                      setValue(newValue);
                      onChange(newValue);
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
    </div>
  );
}
