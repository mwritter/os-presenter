import { useSystemFonts } from "@/hooks/use-system-fonts";
import { Outlet } from "react-router";

const AudienceLayout = () => {
  useSystemFonts();
  return (
    <div className="w-screen h-screen overflow-hidden bg-transparent">
      <Outlet />
    </div>
  );
};

export default AudienceLayout;
