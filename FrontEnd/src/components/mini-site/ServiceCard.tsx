import * as Icons from 'lucide-react'
import type { Service } from '../../types'
import { useMiniSiteNav } from './MiniSiteNav'

const iconColors: Record<number, { bg: string; text: string }> = {
  0: { bg: 'bg-red-500/15', text: 'text-red-400' },
  1: { bg: 'bg-violet-500/15', text: 'text-violet-400' },
  2: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  3: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  4: { bg: 'bg-green-500/15', text: 'text-green-400' },
  5: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
}

interface ServiceCardProps {
  service: Service
  index: number
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const { navigate } = useMiniSiteNav()
  const Icon =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
      service.icon
    ] || Icons.Shield
  const colors = iconColors[index % 6] || iconColors[0]

  return (
    <button
      onClick={() => navigate(`/service/${service.slug}`)}
      className="w-full h-full text-center p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.07] hover:shadow-lg hover:shadow-white/[0.02] transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3"
    >
      <div
        className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
      >
        <Icon className={`w-5 h-5 ${colors.text}`} />
      </div>
      <div className="w-full">
        <h3 className="text-white font-semibold text-sm mb-0.5 break-words">
          {service.title}
        </h3>
        <p className="text-white/35 text-xs leading-relaxed break-words">
          {service.tagline}
        </p>
      </div>
    </button>
  )
}
