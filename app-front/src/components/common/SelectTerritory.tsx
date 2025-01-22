'use client'
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useState } from "react";

export default function SelectTerritory(props: { defaultValue: string, onChangeTerritory:(id:string) => void }) {
  const [ value, setValue ] = useState<string>(props.defaultValue);
  const url = `${Config.get<string>("next.public_api_url", "")}/v3/dashboard/territories`;
  const { data } = useApi<Record<string, string>[]>(url);
  return(
    <Select label='Sélectionner un territoire' 
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