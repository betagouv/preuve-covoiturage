'use client'
import { DashboardContext } from '@/context/DashboardProvider';
import { trimesterList } from '@/helpers/lists';
import { useContext, useEffect, useState } from 'react';
import SelectInList from '../common/SelectInList';


export default function SelectTrimester() {
  const { dashboard } =useContext(DashboardContext);
  const [trimesterAvailable, setTrimesterAvailable] = useState<{id: number; name: string; disabled: boolean;}[]>([]);
  useEffect(()=>{
      const monthTrimester = [3,6,9,12];
      const list = trimesterList.map((m) => {
        if(new Date(dashboard.params.year, monthTrimester[m.id-1],1).getTime() > dashboard.lastPeriod) {
          return {...m, disabled: true}
        } else {
          return {...m, disabled: false}
        }
      })
      setTrimesterAvailable(list)
  },[dashboard.params.year, dashboard.lastPeriod]);
  return (
    <>
      <SelectInList
        labelId='trimester'
        label='Trimestre'
        id={dashboard.params.trimester}
        list={trimesterAvailable}
        sx={{ minWidth: 120 }}
        onChange={(v) => dashboard.onChangeTrimester(v)}
      />
    </>
  );
}
