import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/stringline/")({
  loader: () => {
    throw redirect({
      to: "/stringline/$configuration/today",
      params: {
        configuration: "300",
      },
    });
  },
});
