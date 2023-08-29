import { FormControl, InputLabel, MenuItem, Select, SxProps } from '@mui/material';

interface Props {
  label: string;
  id: number;
  list: {
    id: number;
    name: string;
  }[];
  sx?: SxProps;
  onChange: (v: number) => void;
}

export default function SelectInList(props: Props) {
  return (
    <>
      <FormControl sx={props.sx}>
        <InputLabel id='select-label'>{props.label}</InputLabel>
        <Select
          labelId='select-label'
          value={props.id}
          label={props.label}
          onChange={(event) => props.onChange(event.target.value as number)}
        >
          {props.list.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
