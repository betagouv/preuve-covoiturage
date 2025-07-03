"use client";
import { Config } from "@/config";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/providers/AuthProvider";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useEffect, useState } from "react";
import Loading from "../layout/Loading";

export default function SelectTerritoryByOperator(props: { defaultValue?: number; onChange: (id?: number) => void }) {
  const { user } = useAuth();
  const [value, setValue] = useState<number | undefined>(props.defaultValue);
  const url = `${Config.get<string>(
    "next.public_api_url",
    "",
  )}/v3/dashboard/territories_campaign${user?.operator_id ? `?operator_id=${user?.operator_id}` : ""}`;
  const { data, loading } = useApi<{ id: number; name: string }[]>(url, true);
  useEffect(() => {
    setValue(props.defaultValue);
  }, [props.defaultValue]);
  if (loading) return <Loading />;
  return (
    <Select
      label=""
      nativeSelectProps={{
        value: value ?? "",
        onChange: (e) => {
          const newValue = Number(e.target.value);
          setValue(newValue);
          props.onChange(newValue);
        },
      }}
    >
      <option value="">Selectionner un territoire</option>
      {data?.map((d, i) => (
        <option key={i} value={d.id}>
          {d.name}
        </option>
      ))}
    </Select>
  );
}
