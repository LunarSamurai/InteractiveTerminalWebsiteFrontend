export interface Service {
  slug: string
  title: string
  tagline: string
  description: string
  features: string[]
  icon: string
}

export interface Testimonial {
  id: string
  clientName: string
  company: string
  quote: string
  rating: number
}

export interface ContactForm {
  name: string
  email: string
  phone: string
  company: string
  message: string
}
