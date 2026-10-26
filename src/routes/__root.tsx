import { createRootRoute } from "@tanstack/react-router";

import IndexComponent from "../components/IndexComponent.tsx";

export const Route = createRootRoute({
  component: IndexComponent,
});
