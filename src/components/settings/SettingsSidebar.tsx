import { cn } from "@/lib/utils";
import { Download, Settings, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { SettingsSection } from "@/pages/settings";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const SettingsSidebar = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>();

  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;

  const handleSectionClick = (section: SettingsSection) => {
    navigate(`/settings/${section}`);
  };

  useEffect(() => {
    const section = pathname.split("/").pop();
    setActiveSection(section as SettingsSection);
  }, [pathname]);

  return (
    <div className="w-56 border border-white/10 rounded-lg p-4 gap-3 flex flex-col">
      <SettingsSidebarSection>
        <SettingsSidebarItem
          active={activeSection === "general"}
          onClick={() => handleSectionClick("general")}
        >
          <SettingsSidebarItemIcon bgColor="var(--color-gray-400)">
            <Settings className="size-3" />
          </SettingsSidebarItemIcon>
          <span>General</span>
        </SettingsSidebarItem>
        <SettingsSidebarItem
          active={activeSection === "updates"}
          onClick={() => handleSectionClick("updates")}
        >
          <SettingsSidebarItemIcon bgColor="var(--color-gray-400)">
            <Download className="size-3" />
          </SettingsSidebarItemIcon>
          Updates
        </SettingsSidebarItem>
      </SettingsSidebarSection>

      <SettingsSidebarItem
        active={activeSection === "tag-groups"}
        onClick={() => handleSectionClick("tag-groups")}
      >
        <SettingsSidebarItemIcon bgColor="var(--color-blue-400)">
          <Tag className="size-3" />
        </SettingsSidebarItemIcon>
        Groups
      </SettingsSidebarItem>
    </div>
  );
};

const SettingsSidebarItem = ({
  children,
  active,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "flex justify-start gap-2 px-3 py-2 rounded-md text-xs transition-colors",
        {
          "bg-selected text-white hover:bg-selected!": active,
        },
        className
      )}
    >
      {children}
    </Button>
  );
};

const SettingsSidebarItemIcon = ({
  children,
  bgColor,
}: {
  children: React.ReactNode;
  bgColor: string;
}) => {
  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="flex items-center justify-center rounded-[3px] p-0.5 shadow-sm"
    >
      {children}
    </div>
  );
};

const SettingsSidebarSection = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="flex flex-col gap-1">{children}</div>;
};
