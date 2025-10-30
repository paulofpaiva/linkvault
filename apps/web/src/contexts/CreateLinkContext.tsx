import { createContext, useContext } from 'react'

interface CreateLinkContextValue {
  openCreateLink: () => void
}

const CreateLinkContext = createContext<CreateLinkContextValue | undefined>(undefined)

export function CreateLinkProvider({ children, openCreateLink }: { children: React.ReactNode; openCreateLink: () => void }) {
  return (
    <CreateLinkContext.Provider value={{ openCreateLink }}>
      {children}
    </CreateLinkContext.Provider>
  )
}

export function useCreateLinkContext() {
  const ctx = useContext(CreateLinkContext)
  if (!ctx) throw new Error('useCreateLinkContext must be used within CreateLinkProvider')
  return ctx
}


