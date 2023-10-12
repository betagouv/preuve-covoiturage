import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { TerritoryListInterface } from '@/interfaces/observatoire/dataInterfaces';
import { Autocomplete, AutocompleteChangeReason, TextField, createFilterOptions } from '@mui/material';

type SelectTerritoryProps = {
  code: string;
  type: string;
  year: number;
  onChange: (v: TerritoryListInterface | null, r:AutocompleteChangeReason) => void;
};

export default function SelectTerritory(props: SelectTerritoryProps) {
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const territoryUrl = `${apiUrl}/territories?year=${props.year}`;
  const { data, loading, error } = useApi<TerritoryListInterface[]>(territoryUrl);

  return (
    <>
      {loading && (
        <div>Chargement en cours...</div>
      )}
      {error && (
        <div>{`Un problème est survenu au chargement des données: ${error}`}</div>
      )}
      {data && (
        <Autocomplete
          id='select-territory'
          options={data}
          value={data.find(d => d.territory === props.code)}
          getOptionLabel={(option) => `${option.l_territory} (${option.type})`}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.territory}>
                {option.l_territory} ({option.type})
              </li>
            )
          }}
          renderInput={(params) => <TextField {...params} label='Territoire' />}
          onChange={(e, v, r) => props.onChange(v, r)}
          filterOptions={createFilterOptions({
            matchFrom: 'any',
            limit: 100,
            ignoreCase: true,
            stringify: (option) => option.l_territory,
          })}
        />
      )}
    </>
  );
}
