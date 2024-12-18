'use client'
import SelectTerritory from '@/components/common/SelectTerritory';
import { useAuth } from '@/providers/AuthProvider';
import { fr } from '@codegouvfr/react-dsfr';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useState } from 'react';

export default function TabExport() {
  const { user } = useAuth();
  const [territoryId, setTerritoryId] = useState<string>(user?.territory_id ?? '36101');
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs().subtract(2, 'days'));
  const onChangeTerritory = (id:string) => {
    setTerritoryId(id);
  };
  return(
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        {user?.role === 'admin' &&
          <SelectTerritory defaultValue={territoryId} onChangeTerritory={onChangeTerritory} />
        }
        <span><DatePicker label="Début" value={startDate} onChange={(v) => setStartDate(v!)} minDate={dayjs().subtract(2, 'years')} maxDate={endDate}/></span>
        <span className={fr.cx('fr-pl-5v')}><DatePicker label="Fin" value={endDate} onChange={(v) => setEndDate(v!)} minDate={startDate} maxDate={dayjs().subtract(2, 'days')}/></span>
      </LocalizationProvider>
    </>    
  );
}