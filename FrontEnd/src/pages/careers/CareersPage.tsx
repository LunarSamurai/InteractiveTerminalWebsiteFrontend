import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, MapPin, Clock, Briefcase, ChevronRight, Search, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { JobListing } from '../../types/careers'
import JobDetailModal from './components/JobDetailModal'
import AdminPanel from './components/AdminPanel'

export default function CareersPage() {
  const { isAdmin, user, signOut } = useAuth()
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const { signInWithEmail } = useAuth()

  const fetchJobs = async () => {
    setLoading(true)
    let query = supabase.from('job_listings').select('*').order('created_at', { ascending: false })
    if (!isAdmin) query = query.eq('is_active', true)
    const { data } = await query
    setJobs(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchJobs() }, [isAdmin])

  const departments = [...new Set(jobs.map(j => j.department))]
  const levels = [...new Set(jobs.map(j => j.experience_level))]

  const filtered = jobs.filter(j => {
    if (searchQuery && !j.title.toLowerCase().includes(searchQuery.toLowerCase()) && !j.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterDept && j.department !== filterDept) return false
    if (filterLevel && j.experience_level !== filterLevel) return false
    return true
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const { error } = await signInWithEmail(loginEmail, loginPassword)
    if (error) setLoginError(error)
    else setShowLogin(false)
  }

  if (showAdmin && isAdmin) {
    return <AdminPanel jobs={jobs} onRefresh={fetchJobs} onBack={() => setShowAdmin(false)} />
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to CoreIT</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <button onClick={() => setShowAdmin(true)} className="text-sm text-primary hover:text-primary-light transition-colors font-medium">
                  Admin Panel
                </button>
                <span className="text-white/20">|</span>
              </>
            )}
            {user ? (
              <button onClick={signOut} className="text-sm text-white/40 hover:text-white/60 transition-colors">
                Sign Out
              </button>
            ) : (
              <button onClick={() => setShowLogin(true)} className="text-sm text-white/40 hover:text-white/60 transition-colors">
                Admin Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
          <div className="bg-[#1a1d2e] border border-white/[0.08] rounded-2xl p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-1">Admin Login</h2>
            <p className="text-white/40 text-sm mb-6">Sign in to manage job listings</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-medium transition-colors">
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield size={14} className="text-primary" />
            <span className="text-primary text-xs font-medium tracking-wide uppercase">Join the Cyber Rangers</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Defend the Digital Frontier
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            We're building an elite team of cybersecurity professionals. If you're passionate about protecting businesses and solving complex security challenges, we want to hear from you.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="max-w-6xl mx-auto px-6 mb-10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search positions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50"
            />
          </div>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
          >
            <option value="">All Levels</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </section>

      {/* Job Listings */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/40 text-sm">Loading positions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/40 text-lg">No positions found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(job => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="w-full text-left p-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{job.title}</h3>
                      {!job.is_active && <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-medium rounded-full uppercase">Inactive</span>}
                    </div>
                    <p className="text-white/40 text-sm mb-4 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} />{job.type}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={14} />{job.experience_level}</span>
                      {job.salary_range && <span className="text-primary/80 font-medium">{job.salary_range}</span>}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/20 group-hover:text-primary/60 transition-colors mt-1 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  )
}
