import { useState, useEffect, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMiniSiteNav } from './MiniSiteNav'

interface MiniSiteLayoutProps {
  children: ReactNode
}

export default function MiniSiteLayout({ children }: MiniSiteLayoutProps) {
  const { goBack, goForward, canGoBack, canGoForward } = useMiniSiteNav()
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full h-full flex flex-col bg-[#0c0f1a]">
      {/* macOS menu bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#161a2b]/90 backdrop-blur-sm border-b border-white/[0.06] shrink-0 text-[11px]">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-white/90">Core IT</span>
          <span className="text-white/40">File</span>
          <span className="text-white/40">Edit</span>
          <span className="text-white/40">View</span>
        </div>
        <span className="text-white/40">{time}</span>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center px-3 py-1.5 bg-[#161a2b]/50 border-b border-white/[0.04] shrink-0">
        <div className="flex gap-1.5 mr-3">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex gap-0.5">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/50 cursor-pointer disabled:cursor-default transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/50 cursor-pointer disabled:cursor-default transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
