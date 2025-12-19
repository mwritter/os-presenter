import { Outlet } from "react-router";

const AudienceLayout = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-transparent">
      <Outlet />
    </div>
  );
};

export default AudienceLayout;
