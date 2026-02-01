import { SettingsSidebar } from "@/components/settings/sidebar/SettingsSidebar";
import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { SettingsToolbar } from "@/components/settings/SettingsToolbar";
import { SettingsSidebarProvider } from "@/components/settings/sidebar/context";

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
    <main className="bg-shade-3 w-screen h-screen flex">
      <SettingsSidebarProvider>
        <SettingsSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SettingsToolbar />
          <div className="flex-1 overflow-auto p-4 max-w-md">
            <Outlet />
          </div>
        </div>
      </SettingsSidebarProvider>
    </main>
  );
};

export default RootLayout;
