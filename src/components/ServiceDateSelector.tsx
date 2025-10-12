import { DatePicker, FormGroup, Spinner } from "@patternfly/react-core";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Temporal } from "temporal-polyfill";
import { dateToPlainDate } from "../utils.ts";

interface DateRange {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
}

const validServiceDatesQueryStaleTime = Temporal.Duration.from("PT1M").total({
  unit: "milliseconds",
});

interface Data {
  min_service_date: string;
  max_service_date: string;
}

interface ServiceDateSelectorParams {
  selectedServiceDate: Temporal.PlainDate;
  setSelectedServiceDate: (v: Temporal.PlainDate) => void;
}

const ServiceDateSelector: React.FunctionComponent<
  ServiceDateSelectorParams
> = ({ selectedServiceDate, setSelectedServiceDate }) => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["serviceDateRange"],
    queryFn: async ({ signal }) => {
      const endpoint = new URL(
        "bart_service_date_range",
        import.meta.env.VITE_API_BASE_URL,
      );

      const response = await fetch(endpoint, { signal });

      if (!response.ok) {
        throw new Error("Backend request failed.");
      }

      return (await response.json()) as Data[];
    },
    select: (data): DateRange => {
      const { min_service_date, max_service_date } = data[0];
      return {
        start: Temporal.PlainDate.from(min_service_date),
        end: Temporal.PlainDate.from(max_service_date),
      };
    },
    staleTime: validServiceDatesQueryStaleTime,
  });

  if (isPending) {
    return <Spinner size="md" />;
  }

  if (isError) {
    throw new Error("Error loading valid service dates", { cause: error });
  }

  const rangeValidator = (date: Date) => {
    const d = dateToPlainDate(date);

    if (Temporal.PlainDate.compare(d, data.start) < 0) {
      return "Date is before the allowable range.";
    } else if (Temporal.PlainDate.compare(d, data.end) > 0) {
      return "Date is after the allowable range.";
    }

    return "";
  };

  return (
    <FormGroup label={"Service date"} isRequired fieldId={"service-date"}>
      <DatePicker
        aria-label="Service date"
        placeholder="YYYY-MM-DD"
        value={selectedServiceDate.toString({ calendarName: "never" })}
        onChange={(_event, _value, date) => {
          if (date) {
            setSelectedServiceDate(dateToPlainDate(date));
          }
        }}
        validators={[rangeValidator]}
        required
        inputProps={{ id: "service-date" }}
      />
    </FormGroup>
  );
};

export default ServiceDateSelector;
