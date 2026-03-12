import { motion } from 'framer-motion'
import { Shield, Zap, Users, Clock } from 'lucide-react'

const features = [
  { icon: Shield, title: 'Military-Grade Security', desc: 'Enterprise security protocols adapted for businesses of all sizes.' },
  { icon: Zap, title: 'Rapid Response', desc: '24/7 incident response with average 15-minute acknowledgment time.' },
  { icon: Users, title: 'Certified Experts', desc: 'Team of CISSP, CEH, and CompTIA certified professionals.' },
  { icon: Clock, title: '99.9% Uptime', desc: 'Infrastructure solutions designed for maximum reliability.' },
]

const stats = [
  { num: '500+', label: 'Clients Protected' },
  { num: '99.9%', label: 'Data Recovery Rate' },
  { num: '<15min', label: 'Avg Response Time' },
  { num: '24/7', label: 'Monitoring & Support' },
]

export default function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 lg:py-32">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="text-primary/80 text-xs font-semibold tracking-[0.15em] uppercase">
            About CoreIT
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-6 tracking-tight">
            Why businesses trust{' '}
            <span className="text-gradient">
              CoreIT
            </span>
          </h2>
          <p className="text-white/45 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We bridge the gap between enterprise-grade security and accessible IT solutions.
            Our team of certified professionals keeps your systems secure and running at peak performance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 lg:mb-20 max-w-5xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 sm:p-8 text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{stat.num}</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 sm:p-8 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
