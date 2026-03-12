import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface MiniSiteNavState {
  path: string
  navigate: (to: string) => void
  goBack: () => void
  goForward: () => void
  canGoBack: boolean
  canGoForward: boolean
}

const MiniSiteNavContext = createContext<MiniSiteNavState | null>(null)

export function MiniSiteNavProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<string[]>(['/'])
  const [index, setIndex] = useState(0)

  const navigate = useCallback((to: string) => {
    setHistory(prev => {
      const next = prev.slice(0, index + 1)
      next.push(to)
      return next
    })
    setIndex(prev => prev + 1)
  }, [index])

  const goBack = useCallback(() => {
    setIndex(prev => Math.max(0, prev - 1))
  }, [])

  const goForward = useCallback(() => {
    setIndex(prev => Math.min(history.length - 1, prev + 1))
  }, [history.length])

  return (
    <MiniSiteNavContext.Provider
      value={{
        path: history[index],
        navigate,
        goBack,
        goForward,
        canGoBack: index > 0,
        canGoForward: index < history.length - 1,
      }}
    >
      {children}
    </MiniSiteNavContext.Provider>
  )
}

export function useMiniSiteNav() {
  const ctx = useContext(MiniSiteNavContext)
  if (!ctx) throw new Error('useMiniSiteNav must be used within MiniSiteNavProvider')
  return ctx
}
