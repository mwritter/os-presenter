import { layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  layout("./presenter/layout.tsx", [
    route("/presenter", "./presenter/index.tsx"),
    route("/presenter/edit", "./presenter/edit/index.tsx"),
  ]),
] satisfies RouteConfig;
