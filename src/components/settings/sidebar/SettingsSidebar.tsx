import { cn } from "@/lib/utils";
import { Download, Flag, Home, LucideIcon, PersonStanding, Rocket, Settings, Star, Tag, User, User2 } from "lucide-react";
import { Button } from "../../ui/button";
import { SettingsSection } from "@/pages/settings";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SettingsSidebarSearch } from "./SettingsSidebarSearch";
import { useSettingsSidebar } from "./context";

export const SettingsSidebar = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>();
  const { searchTerm } = useSettingsSidebar();
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

  const sidebarItems = [
    {
      label: "General",
      key: "general",
      icon: <SettingsSidebarItemIcon Icon={Settings} bgColor="var(--color-gray-400)" />,
      onClick: () => handleSectionClick("general"),
    },
    {
      label: "Updates",
      key: "updates",
      icon: <SettingsSidebarItemIcon Icon={Download} bgColor="var(--color-gray-400)" />,
      onClick: () => handleSectionClick("updates"),
    },
    {
      label: "Groups",
      key: "tag-groups",
      icon: <SettingsSidebarItemIcon Icon={Tag} bgColor="var(--color-blue-400)" />,
      onClick: () => handleSectionClick("tag-groups"),
    },
  ].filter((item) => searchTerm?.trim() ? item.label?.toLowerCase().includes(searchTerm?.toLowerCase() ?? "") : true);

  return (
    <div className="w-56 bg-shade-1/90 pt-11 px-3 pb-3 flex flex-col border border-white/20 m-3 rounded-lg">
      <SettingsSidebarSearch />
      <SettingsSidebarItem
        active={activeSection === 'settings'}
        onClick={() => navigate('/settings')}
        className={cn("h-fit", {
          "bg-white/10 hover:bg-white/10!": !activeSection,
        })}
      >
        <SettingsSidebarItemIcon className="p-2" bgColor="var(--color-gray-400)">
          <Rocket className="size-8" />
        </SettingsSidebarItemIcon>
        <div className="flex flex-col text-start">
          <span>Sign in</span>
          <span className="text-white/40 text-[10px]">Register online</span>
        </div>
      </SettingsSidebarItem>
      <Spacer />
      {sidebarItems.length === 0 && (
        <div className="text-white/40 text-xs mt-1 text-center">
          No settings found for "{searchTerm}".
        </div>
      )}
      {sidebarItems.length > 0 && sidebarItems.map((item) => {
        if (!item.onClick) {
          return <Spacer key={item.key} />;
        }
        return (
            <SettingsSidebarItem
              key={item.key}
              active={activeSection === item.key}
              onClick={item.onClick}
            >
              {item.icon}
              <span>{item.label}</span>
            </SettingsSidebarItem>
        )
      })}
    </div>
  );
};

const Spacer = () => {
  return <div className="h-1 w-full" />;
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
      onClick={onClick}
      className={cn(
        "flex justify-start gap-2 px-3 rounded-md text-xs transition-colors hover:bg-transparent!",
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
  Icon,
  bgColor,
  className,
  children,
}: {
  Icon?: LucideIcon;
  bgColor?: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={cn("flex items-center justify-center rounded-[3px] p-0.5 shadow-lg", className)}
    >
      {Icon ? <Icon size={4} /> : children}
    </div>
  );
};
