import { createContext, useContext } from 'react'

interface ManageCategoriesContextValue {
  openManageCategories: () => void
}

const ManageCategoriesContext = createContext<ManageCategoriesContextValue | undefined>(undefined)

export function ManageCategoriesProvider({ children, openManageCategories }: { children: React.ReactNode; openManageCategories: () => void }) {
  return (
    <ManageCategoriesContext.Provider value={{ openManageCategories }}>
      {children}
    </ManageCategoriesContext.Provider>
  )
}

export function useManageCategoriesContext() {
  const ctx = useContext(ManageCategoriesContext)
  if (!ctx) throw new Error('useManageCategoriesContext must be used within ManageCategoriesProvider')
  return ctx
}


