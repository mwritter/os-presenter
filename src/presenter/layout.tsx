import { MediaLibraryProvider } from "@/components/presenter/media-library/context";
import { PresenterProvider } from "@/context/presenter";
import { Outlet } from "react-router";
import { SidebarProvider } from "@/components/presenter/sidebar/context";
import { Toolbar } from "@/components/presenter/toolbar/Toolbar";
import { ContentLayout } from "@/components/presenter/ContentLayout";

const RootLayout = () => {
  return (
    <div className="flex flex-col h-screen w-screen">
      <PresenterProvider>
        <SidebarProvider>
          <MediaLibraryProvider>
            <Toolbar />
            <ContentLayout>
              <Outlet />
            </ContentLayout>
          </MediaLibraryProvider>
        </SidebarProvider>
      </PresenterProvider>
    </div>
  );
};

export default RootLayout;
