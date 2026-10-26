import { createFileRoute } from "@tanstack/react-router";
import ErrorComponent from "../components/ErrorComponent.tsx";
import NotFoundComponent from "../components/NotFoundComponent.tsx";
import StringlineComponent from "../components/StringlineComponent.tsx";

export const Route = createFileRoute("/stringline/$configuration/$serviceDate")(
  {
    component: StringlineComponent,
    errorComponent: ErrorComponent,
    notFoundComponent: NotFoundComponent,
    staticData: {
      fullPage: true,
    },
  },
);
