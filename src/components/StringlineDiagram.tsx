import { useVegaEmbed } from "react-vega";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Temporal } from "temporal-polyfill";
import type { TopLevelSpec } from "vega-lite";
import { EmptyState, Spinner } from "@patternfly/react-core";
import { isCurrentServiceDay, serviceDateToTimeRange } from "../utils.ts";
import { notFound } from "@tanstack/react-router";
import { css } from "@patternfly/react-styles";
import sizing from "@patternfly/react-styles/css/utilities/Sizing/sizing";
import type { EmbedOptions } from "vega-embed";
import { DateTime } from "luxon";

const currentServiceDateStaleTime = Temporal.Duration.from("PT1M").total({
  unit: "millisecond",
});

const currentServiceDateRefreshInterval = Temporal.Duration.from("PT1M").total({
  unit: "millisecond",
});

const nowMarkUpdateInterval = Temporal.Duration.from("PT1M").total({
  unit: "millisecond",
});

interface StringlineDiagramParams {
  configurationId: number;
  serviceDate: Temporal.PlainDate;
}

interface StationName {
  stop_id: string;
  stop_name: string;
}

const stationNamesQueryStaleTime = Temporal.Duration.from("PT24H").total({
  unit: "milliseconds",
});

interface Route {
  route_short_name: string;
  route_color: string;
  route_text_color: string;
}

const routesQueryStaleTime = Temporal.Duration.from("PT24H").total({
  unit: "milliseconds",
});

interface ConfigurationDetails {
  id: number;
  name: string;
  stations: string[];
}

const configurationDetailsQueryStaleTime = Temporal.Duration.from("PT5M").total(
  { unit: "milliseconds" },
);

interface StringlineDatum {
  feed_header_timestamp: string;
  trip_id: string;
  vehicle_label: string;
  stop_id: string;
  event_time: string;
  trip_headsign: string;
  route_short_name: string;
  direction_id: number;
}

function generateNowMarkData() {
  return [
    {
      dt: DateTime.now().setZone("US/Pacific").toFormat("yyyy-MM-dd HH:mm:ss"),
    },
  ];
}

const StringlineDiagram: React.FunctionComponent<StringlineDiagramParams> = ({
  configurationId,
  serviceDate,
}) => {
  const {
    isPending: stnIsPending,
    isError: stnIsError,
    data: stnData,
    error: stnError,
  } = useQuery({
    queryKey: ["stationNames", serviceDate],
    queryFn: async ({ signal, queryKey: [, serviceDate] }) => {
      const endpoint = new URL(
        "bart_stops_for_service_date",
        import.meta.env.VITE_API_BASE_URL,
      );

      endpoint.searchParams.set(
        "service_date",
        (serviceDate as Temporal.PlainDate).toString({
          calendarName: "never",
        }),
      );

      const response = await fetch(endpoint, { signal });

      if (!response.ok) {
        throw new Error("Backend request failed.");
      }

      return (await response.json()) as StationName[];
    },
    staleTime: stationNamesQueryStaleTime,
  });

  if (stnIsError) {
    throw new Error("Error loading station names", { cause: stnError });
  }

  const {
    isPending: rtsIsPending,
    isError: rtsIsError,
    data: rtsData,
    error: rtsError,
  } = useQuery({
    queryKey: ["routes", serviceDate],
    queryFn: async ({ signal, queryKey: [, serviceDate] }) => {
      const endpoint = new URL(
        "bart_routes_for_service_date",
        import.meta.env.VITE_API_BASE_URL,
      );

      endpoint.searchParams.set(
        "service_date",
        (serviceDate as Temporal.PlainDate).toString({
          calendarName: "never",
        }),
      );

      const response = await fetch(endpoint, { signal });

      if (!response.ok) {
        throw new Error("Backend request failed.");
      }

      return (await response.json()) as Route[];
    },
    staleTime: routesQueryStaleTime,
  });

  if (rtsIsError) {
    throw new Error("Error loading routes", { cause: rtsError });
  }

  const {
    isPending: cdIsPending,
    isError: cdIsError,
    data: cdData,
    error: cdError,
  } = useQuery({
    queryKey: ["configurationDetails", configurationId],
    queryFn: async ({ signal, queryKey: [, configurationId] }) => {
      const endpoint = new URL(
        "bart_stringline_configuration_details",
        import.meta.env.VITE_API_BASE_URL,
      );

      endpoint.searchParams.set("configuration_id", configurationId.toString());

      const response = await fetch(endpoint, { signal });

      if (!response.ok) {
        throw new Error("Backend request failed.");
      }

      return (await response.json()) as ConfigurationDetails[];
    },
    select: (data) => data[0],
    staleTime: configurationDetailsQueryStaleTime,
  });

  if (cdIsError) {
    throw new Error("Error loading configuration details", { cause: cdError });
  }

  const staleTime = isCurrentServiceDay(serviceDate)
    ? currentServiceDateStaleTime
    : Infinity;
  const refreshInterval = isCurrentServiceDay(serviceDate)
    ? currentServiceDateRefreshInterval
    : false;

  const {
    isPending: stlIsPending,
    isError: stlIsError,
    data: stlData,
    error: stlError,
  } = useQuery({
    queryKey: ["stringline", configurationId, serviceDate],
    queryFn: async ({ signal, queryKey: [, configurationId, serviceDate] }) => {
      const endpoint = new URL(
        "bart_stringlines",
        import.meta.env.VITE_API_BASE_URL,
      );

      endpoint.searchParams.set("configuration_id", configurationId.toString());
      endpoint.searchParams.set(
        "service_date",
        (serviceDate as Temporal.PlainDate).toString({
          calendarName: "never",
        }),
      );

      const response = await fetch(endpoint, { signal });

      if (!response.ok) {
        throw new Error("Backend request failed.");
      }

      return (await response.json()) as StringlineDatum[];
    },
    staleTime: staleTime,
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: false,
  });

  if (stlIsError) {
    throw new Error("Error loading stringline data", { cause: stlError });
  }

  if (
    [stnIsPending, rtsIsPending, cdIsPending, stlIsPending].some(
      (element) => element,
    )
  ) {
    return <EmptyState titleText="Loading" headingLevel="h4" icon={Spinner} />;
  } else {
    if (cdData === undefined) {
      throw notFound({ routeId: "/stringline/$configuration/$serviceDate" });
    } else if (
      rtsData != undefined &&
      stnData != undefined &&
      stlData != undefined
    ) {
      return (
        <RenderStringline
          serviceDate={serviceDate}
          configurationDetails={cdData}
          routesData={rtsData}
          stopsData={stnData}
          stringlineData={stlData}
        />
      );
    } else {
      throw new Error("Unknown error.");
    }
  }
};

interface RenderStringlineParams {
  serviceDate: Temporal.PlainDate;
  configurationDetails: ConfigurationDetails;
  routesData: Route[];
  stopsData: StationName[];
  stringlineData: StringlineDatum[];
}

const RenderStringline: React.FunctionComponent<RenderStringlineParams> = ({
  serviceDate,
  configurationDetails,
  routesData,
  stopsData,
  stringlineData,
}) => {
  const { start: serviceDayStart, end: serviceDayEnd } =
    serviceDateToTimeRange(serviceDate);

  const sortDataset = configurationDetails.stations.map((value, index) => ({
    stop_id: value,
    sort_order: index,
  }));

  const spec: TopLevelSpec = {
    title: `${configurationDetails.name} Line on ${serviceDate.toString({ calendarName: "never" })}`,
    width: "container",
    height: "container",
    data: {
      name: "stringlineData",
    },
    config: { font: "Red Hat Text" },
    view: { fill: "var(--pf-t--color--gray--30)" },
    layer: [
      {
        transform: [
          {
            lookup: "stop_id",
            from: {
              data: { name: "stationNames" },
              key: "stop_id",
              fields: ["stop_name"],
            },
          },
          {
            lookup: "stop_id",
            from: {
              data: { name: "stationSort" },
              key: "stop_id",
              fields: ["sort_order"],
            },
          },
        ],
        mark: {
          type: "line",
          point: true,
        },
        params: [
          {
            name: "grid",
            select: "interval",
            bind: "scales",
          },
          {
            name: "route",
            select: { type: "point", fields: ["route_short_name"] },
            bind: "legend",
          },
        ],
        encoding: {
          x: {
            field: "event_time",
            type: "temporal",
            axis: { format: "%H:%M" },
            scale: {
              domain: [serviceDayStart.toString(), serviceDayEnd.toString()],
            },
            title: "Time",
          },
          y: {
            field: "stop_name",
            type: "nominal",
            sort: { field: "sort_order" },
            title: "Station",
            axis: {
              grid: true,
            },
          },
          detail: {
            field: "trip_id",
            type: "nominal",
          },
          color: {
            field: "route_short_name",
            type: "nominal",
            title: "Line",
            scale: {
              domain: routesData.map(
                ({ route_short_name }) => route_short_name,
              ),
              range: routesData.map(({ route_color }) => "#" + route_color),
            },
          },
          shape: {
            field: "is_future",
            type: "nominal",
            title: "Observation Type",
            legend: { labelExpr: "datum.value ? 'Predicted': 'Actual'" },
          },
          opacity: {
            condition: { param: "route", value: 1 },
            value: 0.1,
          },
          tooltip: [
            { field: "route_short_name", type: "nominal", title: "Line" },
            { field: "trip_id", type: "nominal", title: "Trip ID" },
            { field: "stop_id", type: "nominal", title: "Station Code" },
            { field: "stop_name", type: "nominal", title: "Station Name" },
            {
              field: "event_time",
              type: "temporal",
              title: "Time",
              format: "%H:%M:%S",
            },
            { field: "trip_headsign", type: "nominal", title: "Destination" },
          ],
        },
      },
      {
        mark: { type: "rule", color: "black", size: 2 },
        encoding: {
          x: { field: "dt", type: "temporal" },
        },
        data: { name: "nowMark" },
      },
    ],
  };

  const ref = React.useRef<HTMLDivElement>(null);
  const options: EmbedOptions = {
    mode: "vega-lite",
    scaleFactor: 2,
  };

  const embed = useVegaEmbed({ ref, spec, options });

  embed?.view.data("nowMark", generateNowMarkData());

  useEffect(() => {
    const intervalId = setInterval(() => {
      void embed?.view.data("nowMark", generateNowMarkData()).runAsync();
    }, nowMarkUpdateInterval);

    return () => {
      clearInterval(intervalId);
    };
  });

  useEffect(() => {
    void embed?.view.data("stringlineData", stringlineData).resize().runAsync();
  }, [embed, stringlineData]);

  useEffect(() => {
    void embed?.view.data("stationNames", stopsData).resize().runAsync();
  }, [embed, stopsData]);

  useEffect(() => {
    void embed?.view.data("stationSort", sortDataset).resize().runAsync();
  }, [embed, sortDataset]);

  return <div className={css(sizing.w_100, sizing.h_100)} ref={ref} />;
};

export default StringlineDiagram;
