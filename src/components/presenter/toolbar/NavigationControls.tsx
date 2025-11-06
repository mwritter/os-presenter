import { IconButton } from "@/components/feature/icon-button/IconButton";
import { Book, Edit2, MoreHorizontal, Play, Text } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const NavigationControls = () => {
    const {pathname} = useLocation();
    const navigate = useNavigate();
    return <div className="flex flex-1 items-center gap-2">
    <IconButton active={pathname === "/presenter"} Icon={Play} label="Show" onClick={() => {navigate("/presenter/show")}} />
    <IconButton Icon={Edit2} label="Edit" />
    <IconButton Icon={Text} label="Reflow" />
    <IconButton Icon={Book} label="Bible" />
    <IconButton Icon={MoreHorizontal} label="More" />
  </div>;
};