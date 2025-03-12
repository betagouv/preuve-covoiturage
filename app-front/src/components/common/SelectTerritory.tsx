"use client";
import { Config } from "@/config";
import { useApi } from "@/hooks/useApi";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useState } from "react";
import { type TerritoriesInterface } from "../../interfaces/dataInterface";

export default function SelectTerritory(props: {
  defaultValue: number;
  onChange: (id: number) => void;
}) {
  const [value, setValue] = useState<number>(props.defaultValue);
  const url = `${Config.get<string>("next.public_api_url", "")}/v3/dashboard/territories`;
  const { data } = useApi<TerritoriesInterface>(url, true);
  return (
    <Select
      label="Sélectionner un territoire"
      nativeSelectProps={{
        value: value,
        onChange: (e) => {
          const newValue = Number(e.target.value);
          setValue(newValue);
          props.onChange(newValue);
        },
      }}
    >
      {data?.data.map((d, i) => (
        <option key={i} value={d.id}>
          {d.name}
        </option>
      ))}
    </Select>
  );
}
