import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { services } from './services-data'
import { useMiniSiteNav } from './MiniSiteNav'

const iconColors: Record<number, { bg: string; text: string }> = {
  0: { bg: 'bg-red-500/15', text: 'text-red-400' },
  1: { bg: 'bg-violet-500/15', text: 'text-violet-400' },
  2: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  3: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  4: { bg: 'bg-green-500/15', text: 'text-green-400' },
  5: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
}

interface ServiceDetailProps {
  slug: string
}

export default function ServiceDetail({ slug }: ServiceDetailProps) {
  const { navigate } = useMiniSiteNav()
  const serviceIndex = services.findIndex((s) => s.slug === slug)
  const service = services[serviceIndex]

  if (!service) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-white/50">Service not found.</p>
          <button onClick={() => navigate('/')} className="text-primary mt-2 cursor-pointer text-sm">
            Go back
          </button>
        </div>
      </div>
    )
  }

  const Icon = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[service.icon] || Icons.Shield
  const colors = iconColors[serviceIndex % 6] || iconColors[0]

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="min-h-full flex flex-col items-center px-8 py-6"
    >
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 cursor-pointer text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Services</span>
        </button>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center`}>
              <Icon className={`w-5.5 h-5.5 ${colors.text}`} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{service.title}</h1>
              <p className="text-white/40 text-xs">{service.tagline}</p>
            </div>
          </div>

          <p className="text-white/50 leading-relaxed mb-6 text-sm">
            {service.description}
          </p>

          <h3 className="text-white font-semibold text-sm mb-3">Key Features</h3>
          <ul className="space-y-2">
            {service.features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5"
              >
                <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-white/50 text-sm">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
