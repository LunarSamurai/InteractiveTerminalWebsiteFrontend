import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import Button from '../ui/Button'

const plans = [
  {
    name: 'Starter',
    price: '$499',
    period: '/month',
    description: 'Essential protection for small businesses',
    features: [
      'Firewall configuration',
      'Basic endpoint protection',
      'Up to 25 endpoints',
      'Email security',
      'Business hours support',
      'Monthly security reports',
    ],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$999',
    period: '/month',
    description: 'Advanced security for growing companies',
    features: [
      'Everything in Starter',
      'Advanced threat detection (EDR)',
      'Up to 100 endpoints',
      'Network monitoring',
      '24/7 incident response',
      'Quarterly security assessments',
      'Data backup & recovery',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Full-scale security operations',
    features: [
      'Everything in Professional',
      'Unlimited endpoints',
      'Dedicated security team',
      'Digital forensics retainer',
      'Compliance management',
      'Custom integrations',
      'SLA-backed guarantees',
      'Executive threat briefings',
    ],
    highlighted: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 lg:py-32 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/4 rounded-full blur-[150px]" />
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
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-6 tracking-tight">
            Plans for Every Business
          </h2>
          <p className="text-white/45 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Scalable security solutions that grow with your organization.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-primary/[0.12] via-surface-light to-surface-light border border-primary/25 shadow-2xl shadow-primary/10 lg:scale-[1.03]'
                  : 'glass-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}
              {plan.highlighted && (
                <div className="inline-flex px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary text-xs font-semibold mb-4">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-white/40 text-sm mt-1 mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl sm:text-5xl font-bold text-white">{plan.price}</span>
                <span className="text-white/40 text-lg">{plan.period}</span>
              </div>

              <Button
                variant={plan.highlighted ? 'primary' : 'secondary'}
                className="w-full mb-8 whitespace-normal"
                onClick={() =>
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Button>

              <div className="section-divider mb-6" />

              <ul className="space-y-3 mt-auto">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-white/55 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
