import { Button } from "@/components/ui/button";

// TODO: add updates settings page
const UpdatesPage = () => {
  return <div className="flex flex-col gap-3">
    <div className="rounded-lg bg-white/5 p-3 max-w-md">
      <div className="flex justify-between items-center">
        <p className="text-sm">Installed Version</p>
        <p className="text-white/40 text-xs">0.1.0</p>
      </div>
      <hr className="my-2" />
      <div className="flex justify-between items-center">
        <p className="text-sm">Date Last Updated</p>
        <p className="text-white/40 text-xs">January 21, 2026 at 12:00 PM</p>
      </div>
    </div>
    <div className="rounded-lg bg-white/5 p-3 max-w-md">
      <div className="flex justify-between items-center">
        <p className="text-sm">Check for Updates</p>
        <Button variant="outline" size="sm">Check Now</Button>
      </div>
    </div>
  </div>;
};

export default UpdatesPage;
