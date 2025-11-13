import { useLocation } from "react-router-dom";

export const useIsEditRoute = () => {
  const { pathname } = useLocation();
  return pathname.startsWith("/presenter/edit");
};
