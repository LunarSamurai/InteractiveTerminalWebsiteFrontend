export interface JobListing {
  id: string
  title: string
  department: string
  location: string
  type: string
  experience_level: string
  salary_range: string | null
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export type JobListingInsert = Omit<JobListing, 'id' | 'created_at' | 'updated_at'>
export type JobListingUpdate = Partial<JobListingInsert>
