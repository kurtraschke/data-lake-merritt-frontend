import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import ServiceDateSelector from "../components/ServiceDateSelector.tsx";
import ConfigurationSelector from "../components/ConfigurationSelector.tsx";
import { Temporal } from "temporal-polyfill";
import StringlineDiagram from "../components/StringlineDiagram.tsx";
import ErrorComponent from "../components/ErrorComponent.tsx";
import { useIsFetching } from "@tanstack/react-query";
import { css } from "@patternfly/react-styles";
import sizing from "@patternfly/react-styles/css/utilities/Sizing/sizing";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import alignment from "@patternfly/react-styles/css/utilities/Alignment/alignment";
import flex from "@patternfly/react-styles/css/utilities/Flex/flex";
import NotFoundComponent from "../components/NotFoundComponent.tsx";

export const Route = createFileRoute("/stringline/$configuration/$serviceDate")(
  {
    component: RouteComponent,
    errorComponent: ErrorComponent,
    notFoundComponent: NotFoundComponent,
    staticData: {
      fullPage: true,
    },
  },
);

function RouteComponent() {
  const { configuration, serviceDate } = Route.useParams();
  const navigate = useNavigate({
    from: "/stringline/$configuration/$serviceDate",
  });
  const isFetching = useIsFetching();

  const setSelectedConfiguration = (selectedConfiguration: string) => {
    void navigate({
      to: "/stringline/$configuration/$serviceDate",
      params: {
        configuration: selectedConfiguration,
        serviceDate: serviceDate,
      },
    });
  };

  const setSelectedServiceDate = (selectedServiceDate: Temporal.PlainDate) => {
    void navigate({
      to: "/stringline/$configuration/$serviceDate",
      params: {
        configuration: configuration,
        serviceDate: selectedServiceDate.toString({ calendarName: "never" }),
      },
    });
  };

  return (
    <Stack className={css(sizing.h_100)}>
      <StackItem>
        <Split hasGutter className={css(spacing.mbSm)}>
          <SplitItem>
            <ConfigurationSelector
              selectedConfiguration={configuration}
              onChangeConfiguration={setSelectedConfiguration}
            />
          </SplitItem>
          <SplitItem>
            <ServiceDateSelector
              selectedServiceDate={Temporal.PlainDate.from(serviceDate)}
              setSelectedServiceDate={setSelectedServiceDate}
            />
          </SplitItem>
          <SplitItem
            isFilled
            className={css(flex.alignSelfFlexEnd, alignment.textAlignEnd)}
          >
            {isFetching ? <Spinner size="md" /> : null}
          </SplitItem>
        </Split>
      </StackItem>
      <StackItem isFilled>
        <StringlineDiagram
          configurationId={Number.parseInt(configuration)}
          serviceDate={Temporal.PlainDate.from(serviceDate)}
        />
      </StackItem>
    </Stack>
  );
}
