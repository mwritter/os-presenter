import { Circle, Shapes, Square } from "lucide-react";
import { useEditContext } from "@/presenter/edit/context";
import { EditViewObjectActionbarButton } from "./EditViewObjectActionbarButton";
import { useNativeMenu } from "@/components/feature/native-menu/hooks/use-native-menu";

export const AddShapeActionbarButton = ({
  disabled,
}: {
  disabled?: boolean;
}) => {
  const { addShapeObject } = useEditContext();
  
  const { openNativeMenu } = useNativeMenu({
    items: [
      {
        id: "rectangle",
        text: "Rectangle",
        action: () => addShapeObject("rectangle"),
      },
      {
        id: "circle",
        text: "Circle",
        action: () => addShapeObject("circle"),
      },
      {
        id: "triangle",
        text: "Triangle",
        action: () => addShapeObject("triangle"),
      },
    ],
  });

  return (
    <EditViewObjectActionbarButton
      icon={<Shapes />}
      label="Shape"
      disabled={disabled}
      onClick={(e) => !disabled && openNativeMenu(e)}
    />
  );
};
