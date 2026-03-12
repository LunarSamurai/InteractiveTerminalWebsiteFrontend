import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/sections/HeroSection'
import MacBookScene from '../components/macbook/MacBookScene'
import AboutSection from '../components/sections/AboutSection'
import ServicesOverview from '../components/sections/ServicesOverview'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import PricingSection from '../components/sections/PricingSection'
import CTASection from '../components/sections/CTASection'
import ContactSection from '../components/sections/ContactSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main>
        <HeroSection />
        <MacBookScene />
        <div className="relative z-10 bg-surface">
          <AboutSection />
          <ServicesOverview />
          <TestimonialsSection />
          <PricingSection />
          <CTASection />
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  )
}
