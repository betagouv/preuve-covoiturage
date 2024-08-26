'use client'
import { DashboardContext } from '@/context/DashboardProvider';
import { monthList } from '@/helpers/lists';
import { useContext, useEffect, useState } from 'react';
import SelectInList from '../common/SelectInList';


export default function SelectMonth() {
  const { dashboard } =useContext(DashboardContext);
 
  const [monthAvailable, setMonthAvailable] = useState<{id: number; name: string; disabled: boolean;}[]>([]);
  useEffect(()=>{
      const list = monthList.map((m) => {
        if(new Date(dashboard.params.year, m.id).getTime() > dashboard.lastPeriod) {
          return {...m, disabled: true}
        } else {
          return {...m, disabled: false}
        }
      })
      setMonthAvailable(list)
  },[dashboard.params.year, dashboard.lastPeriod]);
  return (
    <>
      <SelectInList
        labelId='mois'
        label='Mois'
        id={dashboard.params.month}
        list={monthAvailable}
        sx={{ minWidth: 120 }}
        onChange={(v) => dashboard.onChangeMonth(v)}
      />
    </>
  );
}
