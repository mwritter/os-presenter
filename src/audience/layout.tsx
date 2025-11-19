import { Outlet } from "react-router";

const AudienceLayout = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <Outlet />
    </div>
  );
};

export default AudienceLayout;
