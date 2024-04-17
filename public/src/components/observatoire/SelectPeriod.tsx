'use client'
import { monthList, yearList } from '@/helpers/lists';
import SelectInList from '../common/SelectInList';
import { useContext } from 'react';
import { DashboardContext } from '@/context/DashboardProvider';
import {useState, useEffect} from 'react';


export default function SelectPeriod() {
  const { dashboard } =useContext(DashboardContext);
  const handlerChangeYear = (value: number) => {
    const period = { year: value, month: dashboard.params.month };
    dashboard.onChangePeriod(period);
  };
  const handlerChangeMonth = (value: number) => {
    const period = { year: dashboard.params.year, month: value };
    dashboard.onChangePeriod(period);
  };
  const [monthAvailable, setMonthAvailable] = useState<{id: number; name: string; disabled: boolean;}[]>([]);
  useEffect(()=>{
      const list = monthList.map((m) => {
        if(new Date(dashboard.params.year, m.id -1).getTime() > dashboard.lastPeriod) {
          return {...m, disabled: true}
        } else {
          return {...m, disabled: false}
        }
      })
      setMonthAvailable(list)
  },[dashboard.params.year, dashboard.params.month]);
  return (
    <>
      <SelectInList
        labelId='mois'
        label='Mois'
        id={dashboard.params.month}
        list={monthAvailable}
        sx={{ minWidth: 120 }}
        onChange={handlerChangeMonth}
      />
      <SelectInList
        labelId='annee'
        label='Année'
        id={dashboard.params.year}
        list={yearList}
        sx={{ ml: 3, minWidth: 120 }}
        onChange={handlerChangeYear}
      />
    </>
  );
}
