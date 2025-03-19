import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import OperatorsTable from '../tables/OperatorsTable';

export default function TabOperators() {
  const { user } = useAuth();
  const [key, setKey] = useState(0);
  const refresh = () => {
    setKey(prev => prev + 1); // Change l'état => déclenche un re-render
  };
  return(
    <>
      <OperatorsTable key={key} title={`Gestion des opérateurs`} id={user?.operator_id ?? null} refresh={refresh}  />
    </>    
  );
}
