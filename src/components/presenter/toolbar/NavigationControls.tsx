import { IconButton } from "@/components/feature/icon-button/IconButton";
import { Book, Edit2, MoreHorizontal, Play, Text } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const NavigationControls = () => {
    const {pathname} = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => pathname === path;

    return <div className="flex flex-1 items-center gap-2">
    <IconButton active={isActive("/presenter")} Icon={Play} label="Show" onClick={() => {navigate("/presenter")}} />
    <IconButton active={isActive("/presenter/edit")} Icon={Edit2} label="Edit" onClick={() => {navigate("/presenter/edit")}} />
    <IconButton Icon={Text} label="Reflow" />
    <IconButton Icon={Book} label="Bible" />
    <IconButton Icon={MoreHorizontal} label="More" />
  </div>;
};