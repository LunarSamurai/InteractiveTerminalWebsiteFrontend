import { forwardRef, useRef, useState, useEffect, useCallback } from 'react'
import MiniSiteApp from '../mini-site/MiniSiteApp'
import Dock from '../dock/Dock'
import TerminalWindow from '../terminal/TerminalWindow'

interface MacBookScreenProps {
  interactive: boolean
}

const MacBookScreen = forwardRef<HTMLDivElement, MacBookScreenProps>(
  ({ interactive }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [terminalOpen, setTerminalOpen] = useState(false)
    const [dockVisible, setDockVisible] = useState(false)
    const dockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Scale the mini-site content to fit the screen
    useEffect(() => {
      const el = innerRef.current
      if (!el) return
      const observer = new ResizeObserver(([entry]) => {
        setScale(entry.contentRect.width / 1024)
      })
      observer.observe(el)
      return () => observer.disconnect()
    }, [])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const relativeY = e.clientY - rect.top
      const height = rect.height
      const nearBottom = relativeY > height - 70

      if (nearBottom) {
        if (dockTimeoutRef.current) {
          clearTimeout(dockTimeoutRef.current)
          dockTimeoutRef.current = null
        }
        setDockVisible(true)
      } else {
        if (!dockTimeoutRef.current) {
          dockTimeoutRef.current = setTimeout(() => {
            setDockVisible(false)
            dockTimeoutRef.current = null
          }, 400)
        }
      }
    }, [])

    const handleMouseLeave = useCallback(() => {
      dockTimeoutRef.current = setTimeout(() => {
        setDockVisible(false)
        dockTimeoutRef.current = null
      }, 300)
    }, [])

    return (
      <div
        ref={ref}
        className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden"
        style={{ pointerEvents: interactive ? 'auto' : 'none' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={innerRef} className="w-full h-full relative">
          <div
            className="origin-top-left"
            style={{
              width: 1024,
              height: 680,
              transform: `scale(${scale})`,
            }}
          >
            <MiniSiteApp />
          </div>

          {/* Dock */}
          <Dock
            visible={dockVisible}
            onOpenTerminal={() => setTerminalOpen(true)}
          />

          {/* Terminal */}
          {terminalOpen && (
            <TerminalWindow onClose={() => setTerminalOpen(false)} />
          )}
        </div>
      </div>
    )
  }
)

MacBookScreen.displayName = 'MacBookScreen'
export default MacBookScreen
