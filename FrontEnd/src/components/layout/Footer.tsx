import { Shield, MapPin, Phone, Mail, Clock, Linkedin, Twitter, Github } from 'lucide-react'
import { BRAND } from '../../lib/constants'

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="relative border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-surface to-black/40 pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Shield className="w-7 h-7 text-primary" />
              <span className="text-lg font-bold text-white tracking-tight">
                Core<span className="text-primary">IT</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              {BRAND.tagline}. Protecting businesses with cutting-edge IT solutions and
              cybersecurity services.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Linkedin, href: BRAND.social.linkedin },
                { Icon: Twitter, href: BRAND.social.twitter },
                { Icon: Github, href: BRAND.social.github },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-xl bg-surface-lighter/50 border border-white/5 flex items-center justify-center text-white/30 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {[
                ['about', 'About Us'],
                ['services', 'Services'],
                ['testimonials', 'Testimonials'],
                ['pricing', 'Pricing'],
                ['contact', 'Contact'],
              ].map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className="text-white/40 hover:text-primary transition-colors text-sm cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {[
                'Firewall Standup',
                'Digital Forensics',
                'Data Recovery',
                'Network Infrastructure',
                'Antivirus Solutions',
              ].map((s) => (
                <li key={s}>
                  <span className="text-white/40 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              {[
                { Icon: MapPin, text: `${BRAND.address}\n${BRAND.city}` },
                { Icon: Phone, text: BRAND.phone },
                { Icon: Mail, text: BRAND.email },
                { Icon: Clock, text: BRAND.hours },
              ].map(({ Icon, text }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
                  <span className="text-white/40 text-sm whitespace-pre-line">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="section-divider mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((t) => (
              <a key={t} href="#" className="text-white/25 hover:text-white/50 text-sm transition-colors">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
