import { useLocation } from "react-router-dom";

export const useIsAudienceRoute = () => {
  const { pathname } = useLocation();
  return pathname.startsWith("/audience");
};
