import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { services } from '../mini-site/services-data'

export default function ServicesOverview() {
  return (
    <section id="services" className="py-20 sm:py-28 lg:py-32 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[150px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[120px] -translate-y-1/2" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="text-primary/80 text-xs font-semibold tracking-[0.15em] uppercase">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-6 tracking-tight">
            Comprehensive IT Solutions
          </h2>
          <p className="text-white/45 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            End-to-end IT security and infrastructure services to protect
            and empower your business.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {services.map((service, i) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[service.icon] || Icons.Shield
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 sm:p-8 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-white/45 text-sm mb-5 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2.5">
                  {service.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-white/40 text-sm">
                      <Icons.CheckCircle className="w-4 h-4 text-primary/70 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
