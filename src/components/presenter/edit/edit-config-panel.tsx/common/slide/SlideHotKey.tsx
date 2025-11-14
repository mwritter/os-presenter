import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// TODO: implement slide hot key structure and functionality this is not implemented yet
export const SlideHotKey = () => {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs!" htmlFor="slide-hot-key">
        Hot Key
      </Label>
      <Input
        className="w-[10ch] text-center text-xs! h-min!"
        id="slide-hot-key"
        type="text"
        maxLength={1}
      />
    </div>
  );
};
