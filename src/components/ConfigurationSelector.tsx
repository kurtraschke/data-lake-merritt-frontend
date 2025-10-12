import React from "react";
import {
  FormGroup,
  FormSelect,
  FormSelectOption,
  Spinner,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { Temporal } from "temporal-polyfill";

interface Configuration {
  id: number;
  name: string;
}

const configurationsQueryStaleTime = Temporal.Duration.from("PT5M").total({
  unit: "milliseconds",
});

interface ConfigurationSelectorParams {
  selectedConfiguration: string;
  onChangeConfiguration: (v: string) => void;
}

const ConfigurationSelector: React.FunctionComponent<
  ConfigurationSelectorParams
> = ({ selectedConfiguration, onChangeConfiguration }) => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["configurations"],
    queryFn: async ({ signal }) => {
      const endpoint = new URL(
        "bart_stringline_configurations",
        import.meta.env.VITE_API_BASE_URL,
      );

      const response = await fetch(endpoint, { signal });

      if (!response.ok) {
        throw new Error("Backend request failed.");
      }

      return (await response.json()) as Configuration[];
    },
    staleTime: configurationsQueryStaleTime,
  });

  if (isPending) {
    return <Spinner size="md" />;
  }

  if (isError) {
    throw new Error("Error loading configurations", { cause: error });
  }

  const onChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    value: string,
  ) => {
    onChangeConfiguration(value);
  };

  return (
    <FormGroup label={"Configuration"} isRequired fieldId={"configuration"}>
      <FormSelect
        value={selectedConfiguration}
        onChange={onChange}
        aria-label="Configuration"
        id={"configuration"}
      >
        {data.map((option) => (
          <FormSelectOption
            key={option.id.toString()}
            value={option.id.toString()}
            label={option.name}
          />
        ))}
      </FormSelect>
    </FormGroup>
  );
};

export default ConfigurationSelector;
