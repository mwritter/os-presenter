import { Label } from "@/components/ui/label";
import { TextFontFamilyCombobox } from "./common/text/TextFontFamilyCombobox";
import { TextFontStyle } from "./common/text/TextFontStyleSelect";
import { TextFontSizeInput } from "./common/text/TextFontSizeInput";
import { TextCapitalizationSelect } from "./common/text/TextCapitalizationSelect";
import { TextColorPicker } from "./common/text/TextColorPicker";
import { TextAlignment } from "./common/text/TextAlignment";
import { TextStroke } from "./common/text/TextStroke";
import { useEditContext } from "@/presenter/edit/context";
import {
  TextObject,
  TextAlignment as TextAlignmentType,
} from "@/components/feature/slide/types";
import {
  useSystemFonts,
  getAvailableVariants,
  loadFontVariants,
} from "@/hooks/useSystemFonts";
import { useEffect, useState } from "react";
import { Effect as TextEffect } from "./common/effects/Effect";

export const EditTextConfigPanel = () => {
  const { selectedSlide, selectedObjectId, updateObject } = useEditContext();
  const { fontNames } = useSystemFonts();
  const [, forceUpdate] = useState({});

  // Find the selected object - works with text objects and objects with text overlay
  const selectedObject = selectedSlide?.objects?.find(
    (obj) => obj.id === selectedObjectId
  );

  // Get text properties with defaults for shape/image/video overlays
  const fontFamily =
    (selectedObject && "fontFamily" in selectedObject
      ? selectedObject.fontFamily
      : undefined) || "Arial";
  const fontVariant =
    (selectedObject && "fontVariant" in selectedObject
      ? selectedObject.fontVariant
      : undefined) || "Regular";

  // Extract base font family from full font name
  // If the font family is in our font names list, it's already a base family
  // Otherwise, find which base family the full name starts with (e.g., "American Typewriter Bold" → "American Typewriter")
  const baseFontFamily = fontNames.includes(fontFamily)
    ? fontFamily
    : fontNames.find((family) => fontFamily.startsWith(family)) || fontFamily;

  // Load font variants on demand when base font family changes
  useEffect(() => {
    if (baseFontFamily) {
      loadFontVariants(baseFontFamily).then(() => {
        // Force a rerender after variants are loaded
        forceUpdate({});
      });
    }
  }, [baseFontFamily]);

  // All object types can have text properties:
  // - Text objects: native text
  // - Shape/Image/Video objects: text overlays
  if (!selectedObject) {
    return <div className="p-4 text-xs text-gray-400">No object selected</div>;
  }

  const handleUpdate = (updates: Partial<TextObject>) => {
    updateObject(selectedObject.id, updates);
  };

  const textProps = {
    fontFamily,
    fontVariant,
    baseFontFamily,
    fontSize:
      ("fontSize" in selectedObject ? selectedObject.fontSize : undefined) ||
      48,
    textTransform:
      "textTransform" in selectedObject
        ? selectedObject.textTransform
        : undefined,
    color:
      ("color" in selectedObject ? selectedObject.color : undefined) ||
      "rgba(255, 255, 255, 1)",
    alignment: ("alignment" in selectedObject && selectedObject.alignment
      ? selectedObject.alignment
      : {
          horizontal: "center" as const,
          vertical: "center" as const,
        }) as TextAlignmentType,
    textStrokeColor:
      "textStrokeColor" in selectedObject
        ? selectedObject.textStrokeColor
        : undefined,
    textStrokeWidth:
      "textStrokeWidth" in selectedObject
        ? selectedObject.textStrokeWidth
        : undefined,
  };

  // Get available variants for the selected font
  const availableVariants =
    fontNames.length > 0 ? getAvailableVariants(baseFontFamily) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label className="text-xs!">Typography</Label>
        <div className="flex flex-col gap-2">
          <TextFontFamilyCombobox
            value={textProps.baseFontFamily}
            onChange={(baseFontFamily) => {
              // When font family changes, reset to base name with Regular variant
              handleUpdate({
                fontFamily: baseFontFamily,
                fontVariant: "Regular",
              });
            }}
          />
          <div className="flex items-center gap-2">
            <TextFontStyle
              fontFamily={textProps.baseFontFamily}
              selectedStyle={textProps.fontVariant}
              onChange={(fullFontName) => {
                // Extract the style name from the full font name
                const selectedVariant = availableVariants?.find(
                  (v) => v.fullName === fullFontName
                );
                handleUpdate({
                  fontFamily: fullFontName,
                  fontVariant: selectedVariant?.value || "Regular",
                });
              }}
              availableVariants={availableVariants}
            />
            <TextFontSizeInput
              value={textProps.fontSize}
              onChange={(fontSize) => handleUpdate({ fontSize })}
            />
          </div>
          <TextCapitalizationSelect
            value={textProps.textTransform}
            onChange={(textTransform) => handleUpdate({ textTransform })}
          />
          <hr />
          <TextColorPicker
            value={textProps.color}
            onChange={(color) => handleUpdate({ color })}
          />
          <hr />
          <TextAlignment
            value={textProps.alignment}
            onChange={(alignment) => handleUpdate({ alignment })}
          />
          <hr />
          <TextStroke
            strokeColor={textProps.textStrokeColor}
            strokeWidth={textProps.textStrokeWidth}
            onChange={(update) => {
              // Map strokeColor/strokeWidth back to textStrokeColor/textStrokeWidth
              const textUpdate: any = {};
              if (update.strokeColor !== undefined) {
                textUpdate.textStrokeColor = update.strokeColor;
              }
              if (update.strokeWidth !== undefined) {
                textUpdate.textStrokeWidth = update.strokeWidth;
              }
              handleUpdate(textUpdate);
            }}
          />
          <hr />
          <TextEffect
            value={
              "textShadow" in selectedObject && selectedObject.textShadow
                ? { shadow: selectedObject.textShadow }
                : undefined
            }
            onChange={(effect) => handleUpdate({ textShadow: effect?.shadow })}
          />
        </div>
      </div>
      <hr />
    </div>
  );
};
