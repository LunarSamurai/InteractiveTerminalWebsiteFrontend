import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO',
    company: 'Nexus Financial',
    quote: 'CoreIT\'s forensic team helped us identify and contain a breach within hours. Their expertise and professionalism were outstanding.',
    rating: 5,
  },
  {
    name: 'Marcus Williams',
    role: 'VP Operations',
    company: 'Atlas Manufacturing',
    quote: 'After a ransomware attack, CoreIT recovered 99.8% of our data. They saved our business — literally.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'IT Director',
    company: 'Bright Health Systems',
    quote: 'The network infrastructure CoreIT deployed has been rock-solid. Zero unplanned downtime in 18 months.',
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'CEO',
    company: 'Pinnacle Software',
    quote: 'Their firewall setup and managed security gives us peace of mind. Best IT investment we\'ve made.',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 sm:py-28 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-light/20 to-surface pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="text-primary/80 text-xs font-semibold tracking-[0.15em] uppercase">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-6 tracking-tight">
            Trusted by Industry Leaders
          </h2>
          <p className="text-white/45 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            See what our clients say about working with CoreIT.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden group"
            >
              <Quote className="w-10 h-10 text-primary/10 absolute top-6 right-6" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-white/60 leading-relaxed mb-6 text-[15px]">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-white font-semibold text-sm">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-white/35 text-xs">{t.role}, {t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
