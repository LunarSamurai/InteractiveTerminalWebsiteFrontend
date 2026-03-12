import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, MapPin, Phone, Mail, Clock } from 'lucide-react'
import Button from '../ui/Button'
import { BRAND } from '../../lib/constants'

export default function ContactSection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    // TODO: Wire to Go backend POST /api/contact
    await new Promise((r) => setTimeout(r, 1000))
    setStatus('sent')
    setForm({ name: '', email: '', phone: '', company: '', message: '' })
    setTimeout(() => setStatus('idle'), 5000)
  }

  const inputClasses =
    'w-full px-4 py-3.5 bg-surface-lighter/50 border border-white/8 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm'

  return (
    <section id="contact" className="py-20 sm:py-28 lg:py-32 relative">
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
            Contact Us
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-6 tracking-tight">
            Let's Talk Security
          </h2>
          <p className="text-white/45 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Ready to secure your business? Get in touch for a free consultation.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Contact form */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 glass-card rounded-2xl p-6 sm:p-8 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name *"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClasses}
              />
              <input
                type="email"
                placeholder="Email Address *"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClasses}
              />
              <input
                type="text"
                placeholder="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className={inputClasses}
              />
            </div>
            <textarea
              placeholder="Tell us about your needs *"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClasses} resize-none`}
            />

            {status === 'sent' ? (
              <div className="flex items-center gap-2 text-green-400 py-3">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Message sent successfully! We'll be in touch soon.</span>
              </div>
            ) : (
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === 'sending'}>
                {status === 'sending' ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </motion.form>

          {/* Contact info sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {[
              {
                Icon: MapPin,
                title: 'Visit Us',
                lines: [BRAND.address, BRAND.city],
              },
              {
                Icon: Phone,
                title: 'Call Us',
                lines: [BRAND.phone],
              },
              {
                Icon: Mail,
                title: 'Email Us',
                lines: [BRAND.email],
              },
              {
                Icon: Clock,
                title: 'Business Hours',
                lines: [BRAND.hours],
              },
            ].map(({ Icon, title, lines }) => (
              <div key={title} className="glass-card rounded-2xl p-5 sm:p-6 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
                  {lines.map((line) => (
                    <p key={line} className="text-white/40 text-sm">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
