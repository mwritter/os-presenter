import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontVariantOption } from "@/hooks/use-system-fonts";

export const TextFontStyle = ({
  fontFamily,
  selectedStyle,
  onChange,
  availableVariants,
}: {
  fontFamily: string;
  selectedStyle?: string; // The currently selected style name (e.g., "Bold", "Condensed Bold")
  onChange: (fullFontName: string) => void;
  availableVariants?: FontVariantOption[];
}) => {
  const currentStyle = selectedStyle || "Regular";

  // Use provided variants or fallback to default options
  const variants: FontVariantOption[] = availableVariants || [
    { label: "Regular", value: "Regular", fullName: "Regular" },
  ];

  // Find current variant by style name
  const currentVariant = variants.find((v) => v.value === currentStyle);
  const displayValue = currentVariant?.value || variants[0]?.value || "Regular";

  const handleChange = (styleName: string) => {
    // Find the variant by its style name
    const selectedVariant = variants.find((v) => v.value === styleName);

    if (selectedVariant) {
      // Return the full font name to use in CSS
      onChange(selectedVariant.fullName);
    }
  };

  return (
    <Select value={displayValue} onValueChange={handleChange}>
      <SelectTrigger className="w-full text-xs! h-min! py-1">
        <div style={{ fontFamily: `${fontFamily} ${currentVariant?.value}` }}>
          <SelectValue placeholder="Select variant" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {variants.map((variant) => (
          <SelectItem
            style={{ fontFamily: `${fontFamily} ${variant.value}` }}
            key={variant.value}
            value={variant.value}
          >
            {variant.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
