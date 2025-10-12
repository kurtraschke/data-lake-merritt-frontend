import { createFileRoute, redirect } from "@tanstack/react-router";
import { currentServiceDay } from "../utils.ts";

export const Route = createFileRoute("/stringline/$configuration/today")({
  loader: ({ params: { configuration } }) => {
    throw redirect({
      to: "/stringline/$configuration/$serviceDate",
      params: {
        configuration: configuration,
        serviceDate: currentServiceDay().toString({ calendarName: "never" }),
      },
    });
  },
});
