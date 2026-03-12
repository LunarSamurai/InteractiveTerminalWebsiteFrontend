import { useRef } from 'react'
import { motion, useMotionValue, AnimatePresence } from 'framer-motion'
import DockItem from './DockItem'
import { Home, Globe, Terminal, Settings, Mail } from 'lucide-react'

interface DockProps {
  visible: boolean
  onOpenTerminal: () => void
}

export default function Dock({ visible, onOpenTerminal }: DockProps) {
  const mouseX = useMotionValue(Infinity)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50"
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
        >
          <div className="flex items-end gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
            <DockItem icon={Home} label="Home" mouseX={mouseX} />
            <DockItem icon={Globe} label="Services" mouseX={mouseX} />
            <div className="w-px h-8 bg-white/20 mx-1 self-center" />
            <DockItem
              icon={Terminal}
              label="Terminal"
              mouseX={mouseX}
              onClick={onOpenTerminal}
            />
            <DockItem icon={Settings} label="Settings" mouseX={mouseX} />
            <DockItem icon={Mail} label="Contact" mouseX={mouseX} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
