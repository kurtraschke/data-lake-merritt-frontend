import { createFileRoute } from "@tanstack/react-router";

import FaqComponent from "../components/FaqComponent.tsx";

export const Route = createFileRoute("/faq")({
  component: FaqComponent,
});
