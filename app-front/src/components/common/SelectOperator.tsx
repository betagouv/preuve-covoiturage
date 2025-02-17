'use client'
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useState } from "react";

export default function SelectOperator(props: { defaultValue: number, onChange:(id:number) => void }) {
  const [value, setValue] = useState<number>(props.defaultValue);
  const url = `${Config.get<string>("next.public_api_url", "")}/v3/dashboard/operators`;
  const { data } = useApi<{id:number, name:string}[]>(url);
  return(
    <Select label='Sélectionner un opérateur' 
      nativeSelectProps={{
        value: value,
        onChange: (e) => {
          const newValue = Number(e.target.value);
          setValue(newValue);
          props.onChange(newValue);
        }
      }}
      
    > 
      { data &&
        data.map((d, i) => <option key={i} value={d.id}>{d.name}</option>)
      }
    </Select>

  );

}