'use client'
import { yearList } from '@/helpers/lists';
import { useDashboard } from '@/hooks/useDashboard';
import SelectInList from '../common/SelectInList';


export default function SelectYear() {
  const dashboard = useDashboard();
 
  return (
    <>
      <SelectInList
        labelId='year'
        label='Année'
        id={dashboard.params.year}
        list={yearList}
        sx={{ minWidth: 120, margin: '0 0.5em' }}
        onChange={(v) => dashboard.onChangeYear(v)}
      />
    </>
  );
}
