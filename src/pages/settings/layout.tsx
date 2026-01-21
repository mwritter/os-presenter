import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

const RootLayout = () => {
  const navigate = useNavigate();

  // Listen for navigation events from other windows
  useEffect(() => {
    const unlisten = listen<{ path: string }>("settings:navigate", (event) => {
      console.log("Settings: Navigating to", event.payload.path);
      navigate(event.payload.path);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [navigate]);

  return (
    <main className="bg-shade-3 w-screen h-screen">
      <div className="flex h-full p-2 gap-2">
        <SettingsSidebar />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default RootLayout;
