import { useRef, useState } from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'

interface DockItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  mouseX: MotionValue<number>
  onClick?: () => void
}

export default function DockItem({ icon: Icon, label, mouseX, onClick }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [hovered, setHovered] = useState(false)

  const distance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return 150
    return val - rect.left - rect.width / 2
  })

  const size = useTransform(distance, [-100, 0, 100], [40, 64, 40])
  const iconSize = useTransform(distance, [-100, 0, 100], [18, 28, 18])

  return (
    <motion.button
      ref={ref}
      style={{ width: size, height: size }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
    >
      <motion.div style={{ width: iconSize, height: iconSize }} className="flex items-center justify-center">
        <Icon className="w-full h-full text-white/80" />
      </motion.div>

      {/* Tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-white text-xs whitespace-nowrap"
        >
          {label}
        </motion.div>
      )}
    </motion.button>
  )
}
