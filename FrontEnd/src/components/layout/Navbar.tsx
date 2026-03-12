import { useState, useEffect } from 'react'
import { Shield, Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent'
      )}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Core<span className="text-primary">IT</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            ['about', 'About'],
            ['services', 'Services'],
            ['testimonials', 'Testimonials'],
            ['pricing', 'Pricing'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-white/50 hover:text-white transition-colors duration-200 text-sm font-medium cursor-pointer px-4 py-2 rounded-lg hover:bg-white/5"
            >
              {label}
            </button>
          ))}
          <div className="ml-3 pl-3 border-l border-white/[0.06]">
            <Button size="sm" onClick={() => scrollTo('contact')}>
              Contact Us
            </Button>
          </div>
        </div>

        <button
          className="md:hidden text-white cursor-pointer p-2 -mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-white/5 px-4 py-3">
          {[
            ['about', 'About'],
            ['services', 'Services'],
            ['testimonials', 'Testimonials'],
            ['pricing', 'Pricing'],
            ['contact', 'Contact Us'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="block w-full text-left text-white/60 hover:text-white hover:bg-white/5 py-3 px-4 rounded-lg cursor-pointer transition-colors text-sm font-medium"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
