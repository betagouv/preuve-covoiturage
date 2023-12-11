import { territoryList } from '@/helpers/lists';

import { PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

type SelectObserveProps = {
  label: string,
  type: PerimeterType,
  value: string,
  onChange: (v: PerimeterType) => void,
};

export default function SelectObserve(props: SelectObserveProps) {
  const handlerChangeObserve = (value: PerimeterType) => {
    props.onChange(value);
  };
  const observeObject = territoryList.find(d=>d.id===props.type)
  const filteredList = observeObject ? territoryList.filter(d=> territoryList.indexOf(d) < territoryList.indexOf(observeObject)) : [];
  return (
    <>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>{props.label}</InputLabel>
        <Select
          labelId={props.label}
          value={props.value}
          label={props.label}
          onChange={(event) => handlerChangeObserve(event.target.value as PerimeterType)}
        >
          {filteredList.map((d, i: number) => (
            <MenuItem key={i} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
