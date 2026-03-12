import { motion } from 'framer-motion'
import ServiceCard from './ServiceCard'
import { services } from './services-data'

export default function MiniSiteHome() {
  return (
    <div className="min-h-full px-8 py-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-8 w-full"
      >
        <h1 className="text-2xl font-bold text-white mb-1.5">
          Our IT Services
        </h1>
        <p className="text-white/40 text-sm">
          Professional solutions for all your technology needs
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[700px]" style={{ gridAutoRows: '1fr' }}>
        {services.map((service, i) => (
          <motion.div
            key={service.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="h-full"
          >
            <ServiceCard service={service} index={i} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
