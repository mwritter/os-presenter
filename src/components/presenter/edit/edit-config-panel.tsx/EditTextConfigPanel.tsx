import { Label } from "@/components/ui/label";
import { TextFontFamilyCombobox } from "./common/text/TextFontFamilyCombobox";
import { TextFontStyle } from "./common/text/TextFontStyleSelect";
import { TextFontSizeInput } from "./common/text/TextFontSizeInput";
import { TextCapitalizationSelect } from "./common/text/TextCapitalizationSelect";
import { TextColorPicker } from "./common/text/TextColorPicker";
import { TextAlignment } from "./common/text/TextAlignment";
import { TextStroke } from "./common/text/TextStroke";
import { useEditContext } from "@/presenter/edit/context";
import { TextObject } from "@/components/feature/slide/types";

export const EditTextConfigPanel = () => {
  const { selectedSlide, selectedObjectId, updateObject } = useEditContext();

  // Find the selected object - works with text objects and objects with text overlay
  const selectedObject = selectedSlide?.objects?.find(
    (obj) => obj.id === selectedObjectId
  );

  // All object types can have text properties:
  // - Text objects: native text
  // - Shape/Image/Video objects: text overlays
  if (!selectedObject) {
    return <div className="p-4 text-xs text-gray-400">No object selected</div>;
  }

  const handleUpdate = (updates: Partial<TextObject>) => {
    updateObject(selectedObject.id, updates);
  };

  // Get text properties with defaults for shape/image/video overlays
  const textProps = {
    fontFamily:
      ("fontFamily" in selectedObject
        ? selectedObject.fontFamily
        : undefined) || "Arial",
    fontStyle:
      ("fontStyle" in selectedObject ? selectedObject.fontStyle : undefined) ||
      "normal",
    fontSize:
      ("fontSize" in selectedObject ? selectedObject.fontSize : undefined) ||
      48,
    textTransform:
      "textTransform" in selectedObject
        ? selectedObject.textTransform
        : undefined,
    color:
      ("color" in selectedObject ? selectedObject.color : undefined) ||
      "#FFFFFF",
    alignment: (("alignment" in selectedObject
      ? selectedObject.alignment
      : undefined) || "center") as "left" | "center" | "right",
    textStrokeColor:
      "textStrokeColor" in selectedObject
        ? selectedObject.textStrokeColor
        : undefined,
    textStrokeWidth:
      "textStrokeWidth" in selectedObject
        ? selectedObject.textStrokeWidth
        : undefined,
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label className="text-xs!">Typography</Label>
        <div className="flex flex-col gap-2">
          <TextFontFamilyCombobox
            value={textProps.fontFamily}
            onChange={(fontFamily) => handleUpdate({ fontFamily })}
          />
          <div className="flex items-center gap-2">
            <TextFontStyle
              value={textProps.fontStyle}
              onChange={(fontStyle) => handleUpdate({ fontStyle })}
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
        </div>
      </div>
      <hr />
    </div>
  );
};
