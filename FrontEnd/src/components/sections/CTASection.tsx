import { motion } from 'framer-motion'
import { ArrowRight, Shield } from 'lucide-react'
import Button from '../ui/Button'

export default function CTASection() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/8 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden max-w-4xl mx-auto"
        >
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Shield className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Secure Your Business{' '}
            <span className="text-gradient">
              Today
            </span>
          </h2>
          <p className="text-white/45 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Don't wait for a breach. Get proactive with CoreIT's enterprise-grade
            security solutions and protect what matters most.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              onClick={() =>
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Get a Free Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() =>
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              View Our Services
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
