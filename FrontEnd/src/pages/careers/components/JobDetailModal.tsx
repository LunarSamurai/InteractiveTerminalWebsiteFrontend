import { X, MapPin, Clock, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react'
import type { JobListing } from '../../../types/careers'

interface Props {
  job: JobListing
  onClose: () => void
}

export default function JobDetailModal({ job, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#12151f] border border-white/[0.08] rounded-2xl w-full max-w-3xl shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-8 border-b border-white/[0.06]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-primary text-xs font-semibold tracking-wide uppercase">{job.department}</span>
              <h2 className="text-2xl font-bold text-white mt-1">{job.title}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/50">
                <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} />{job.type}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={14} />{job.experience_level}</span>
              </div>
              {job.salary_range && (
                <p className="mt-2 text-primary font-semibold">{job.salary_range}</p>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-white/30 hover:text-white/60 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">About the Role</h3>
            <p className="text-white/70 leading-relaxed">{job.description}</p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Responsibilities</h3>
              <ul className="space-y-2">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                    <ArrowRight size={14} className="text-primary mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Benefits</h3>
              <div className="grid grid-cols-2 gap-2">
                {job.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/60 text-sm p-2 bg-white/[0.02] rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {b}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-white/30 text-xs">Posted {new Date(job.created_at).toLocaleDateString()}</p>
          <a
            href={`mailto:careers@coreit.com?subject=Application: ${job.title}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-medium transition-colors"
          >
            Apply Now
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}
