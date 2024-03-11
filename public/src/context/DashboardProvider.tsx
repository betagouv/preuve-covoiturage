import { useDashboard } from '@/hooks/useDashboard'
import { DashboardContextType } from '@/interfaces/common/contextInterface'
import { createContext } from 'react'
 
export const DashboardContext = createContext({} as DashboardContextType)
 
export default function DashboardContextProvider({children}: { children: React.ReactNode}) {
  const dashboard = useDashboard();
  const context = {
    dashboard,
  };
  return( 
    <DashboardContext.Provider value={context}>
      {children}
    </DashboardContext.Provider>
  )
}
