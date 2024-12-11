'use client'
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useState } from "react";

export default function SelectTerritory(props: { onChangeTerritory:(id:string) => void }) {
  const [ value, setValue ] = useState<string>();
  const url = `${Config.get<string>("next.public_api_url", "")}/v3/dashboard/territories`;
  const { data } = useApi<Record<string, string>[]>(url);
  return(
    <Select label='' 
      nativeSelectProps={{
        value: value,
        onChange: (e) => {
          setValue(e.target.value);
          props.onChangeTerritory(e.target.value);
        }
      }}
      
    > 
      { data &&
        data.map((d, i) => <option key={i} value={d.id}>{d.name}</option>)
      }
    </Select>

  );

}