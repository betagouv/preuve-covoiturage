import { territoryList } from '@/helpers/lists';
import { useDashboard } from '@/hooks/useDashboard';
import { PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

type SelectObserveProps = {
  id: string,
  label: string,
};

export default function SelectObserve(props: SelectObserveProps) {
  const dashboard = useDashboard();

  const observeObject = territoryList.find(d=>d.id===dashboard.params.type)
  const filteredList = observeObject ? territoryList.filter(d=> territoryList.indexOf(d) < territoryList.indexOf(observeObject)) : [];
  return (
    <>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id={props.id}>{props.label}</InputLabel>
        <Select
          labelId={props.id}
          value={dashboard.params.observe}
          label={props.label}
          onChange={(event) => dashboard.onChangeObserve(event.target.value as PerimeterType)}
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
