import { motion } from 'framer-motion'
import TerminalEmulator from './TerminalEmulator'

interface TerminalWindowProps {
  onClose: () => void
}

export default function TerminalWindow({ onClose }: TerminalWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute inset-8 z-40 flex flex-col rounded-xl overflow-hidden shadow-2xl border border-white/10"
    >
      {/* Title bar */}
      <div className="flex items-center px-4 py-2.5 bg-[#2d2d2d] shrink-0">
        <div className="flex gap-2 mr-4">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 cursor-pointer transition-all"
          />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="flex-1 text-center text-white/40 text-xs font-medium">
          Terminal — guest@coreit
        </span>
        <div className="w-14" />
      </div>

      {/* Terminal body */}
      <div className="flex-1 bg-[#1a1a1a] overflow-hidden">
        <TerminalEmulator />
      </div>
    </motion.div>
  )
}
