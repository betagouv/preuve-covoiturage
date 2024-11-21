import { useDashboard } from '@/hooks/useDashboard';
import { DashboardContextType } from '@/interfaces/common/contextInterface';
import { createContext } from 'react';
 
export default function DashboardContextProvider({children}: { children: React.ReactNode}) {
  const dashboard = useDashboard();
  const DashboardContext = createContext<DashboardContextType>({dashboard})
  return( 
    <DashboardContext.Provider value={{dashboard}}>
      {children}
    </DashboardContext.Provider>
  )
}
