'use client'
import { DashboardContext } from '@/context/DashboardProvider';
import { semesterList } from '@/helpers/lists';
import { useContext, useEffect, useState } from 'react';
import SelectInList from '../common/SelectInList';


export default function SelectSemester() {
  const { dashboard } =useContext(DashboardContext);
  const [semesterAvailable, setSemesterAvailable] = useState<{id: number; name: string; disabled: boolean;}[]>([]);
  useEffect(()=>{
      const monthSemester = [6,12];
      const list = semesterList.map((m) => {
        if(new Date(dashboard.params.year, monthSemester[m.id-1],1).getTime() > dashboard.lastPeriod) {
          return {...m, disabled: true}
        } else {
          return {...m, disabled: false}
        }
      })
      setSemesterAvailable(list)
  },[dashboard.params.year, dashboard.lastPeriod]);
  return (
    <>
      <SelectInList
        labelId='semester'
        label='Semestre'
        id={dashboard.params.semester}
        list={semesterAvailable}
        sx={{ minWidth: 120 }}
        onChange={(v) => dashboard.onChangeSemester(v)}
      />
    </>
  );
}
