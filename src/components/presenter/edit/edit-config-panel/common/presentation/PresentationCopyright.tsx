import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

// gets the presentation copyright information
export const PresentationCopyright = () => {
  const [showOnScreenCheck, setShowOnScreenCheck] = useState(false);
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="copyright">
        <AccordionTrigger>
          <Label className="text-xs!">Copyright</Label>
        </AccordionTrigger>
        <AccordionContent className="grid gap-2 p-1">
          <div className="flex items-center gap-2 mb-2">
            <Checkbox
              id="copyright-title-checkbox"
              checked={showOnScreenCheck}
              onClick={() => setShowOnScreenCheck(!showOnScreenCheck)}
            />
            <Label className="text-xs!" htmlFor="copyright-title-checkbox">
              Show on screen
            </Label>
          </div>
          <Input
            className="text-xs! h-min!"
            id="copyright-title"
            type="text"
            placeholder="Enter title"
          />
          <Input
            className="text-xs! h-min!"
            id="copyright-artist"
            type="text"
            placeholder="Enter artist"
          />
          <Input
            className="text-xs! h-min!"
            id="copyright-author"
            type="text"
            placeholder="Enter author"
          />
          <Input
            className="text-xs! h-min!"
            id="copyright-album"
            type="text"
            placeholder="Enter album"
          />
          <Input
            className="text-xs! h-min!"
            id="copyright-publisher"
            type="text"
            placeholder="Enter publisher"
          />
          <Input
            className="text-xs! h-min!"
            id="copyright-year"
            type="text"
            placeholder="Enter year"
          />
          <Input
            className="text-xs! h-min!"
            id="copyright-ccli-number"
            type="text"
            placeholder="Enter CCLI number"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
