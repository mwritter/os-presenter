import { layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  layout("./pages/presenter/layout.tsx", [
    route("/pages/presenter", "./pages/presenter/index.tsx"),
    route("/pages/presenter/edit", "./pages/presenter/edit/index.tsx"),
  ]),
  layout("./pages/audience/layout.tsx", [
    route("/pages/audience", "./pages/audience/index.tsx"),
  ]),
  layout("./pages/settings/layout.tsx", [
    route("/settings", "./pages/settings/index.tsx"),
    route("/settings/tag-groups", "./pages/settings/groups/index.tsx"),
    route("/settings/general", "./pages/settings/general/index.tsx"),
    route("/settings/updates", "./pages/settings/updates/index.tsx"),
  ]),
] satisfies RouteConfig;
