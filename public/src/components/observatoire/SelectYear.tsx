'use client'
import { DashboardContext } from '@/context/DashboardProvider';
import { yearList } from '@/helpers/lists';
import { useContext } from 'react';
import SelectInList from '../common/SelectInList';


export default function SelectMonth() {
  const { dashboard } =useContext(DashboardContext);
 
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
