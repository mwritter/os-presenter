import { Label } from "@/components/ui/label";
import { ShapeAlignmentBar } from "./common/shape/ShapeAlignmentBar";
import { ShapePositionInputs } from "./common/shape/ShapePositionInputs";
import { ShapeSizeInputs } from "./common/shape/ShapeSizeInputs";
import { ShapeTransformInputs } from "./common/shape/ShapeTransformInputs";
import { ShapeFill } from "./common/shape/ShapeFill";
import { ShapeStroke } from "./common/shape/ShapeStroke";

export const EditShapeConfigPanel = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label className="text-xs!">Position</Label>
        <div className="flex flex-col gap-2">
          <ShapeAlignmentBar />
          <ShapePositionInputs x={0} y={0} onChange={() => {}} />
        </div>
      </div>
      <hr />
      <ShapeSizeInputs width={1} height={1} onChange={() => {}} />
      <hr />
      <ShapeTransformInputs flip={[]} rotation={0} />
      <hr />
      <ShapeFill />
      <hr />
      <ShapeStroke />
      <hr />
    </div>
  );
};
