import Select from "@codegouvfr/react-dsfr/Select";
import { useMemo, useState } from "react";
import { Config } from "../../config";
import { useApi } from "../../hooks/useApi";
import { type CampaignsInterface, type TerritorySelectorsInterface } from "../../interfaces/dataInterface";

export default function SelectPolicyPerimeter(props: {
  operatorId?: number;
  onChange: (id?: TerritorySelectorsInterface) => void;
}) {
  const url = `${Config.get<string>("auth.domain")}/rpc?methods=campaign:list`;
  const [value, setValue] = useState<string | null>(null);
  const init = useMemo(() => {
    const params = {
      ...(props.operatorId && { operator_id: props.operatorId }),
    };
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "campaign:list",
        params: params,
        id: 1,
      }),
    };
  }, [props.operatorId]);
  const { data, loading } = useApi<{
    id: number;
    result: { meta: null; data: CampaignsInterface[] };
    jsonrpc: string;
  }>(url, false, init);

  return (
    <Select
      label=""
      nativeSelectProps={{
        value: value ?? "",
        onChange: (e) => {
          const policy: CampaignsInterface | null = data?.result?.data.find((d) => d.name === e.target.value) ?? null;
          if (!policy) {
            return;
          }
          setValue(policy.name);
          props.onChange(policy.territory_selector);
        },
      }}
    >
      <option value="">Selectionner une campagne</option>
      {data?.result?.data?.map((d, i) => (
        <option key={i} value={d.name}>
          {d.name}
        </option>
      ))}
    </Select>
  );
}
