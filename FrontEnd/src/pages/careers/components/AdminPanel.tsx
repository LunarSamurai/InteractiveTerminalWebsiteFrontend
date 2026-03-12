import { useState } from 'react'
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, Save, X } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { JobListing, JobListingInsert } from '../../../types/careers'

interface Props {
  jobs: JobListing[]
  onRefresh: () => void
  onBack: () => void
}

const emptyJob: JobListingInsert = {
  title: '',
  department: 'Cybersecurity',
  location: 'Remote (US)',
  type: 'Full-time',
  experience_level: 'Mid-Level',
  salary_range: '',
  description: '',
  requirements: [''],
  responsibilities: [''],
  benefits: [''],
  is_active: true,
}

export default function AdminPanel({ jobs, onRefresh, onBack }: Props) {
  const [editing, setEditing] = useState<JobListingInsert & { id?: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)

    const data = {
      ...editing,
      requirements: editing.requirements.filter(Boolean),
      responsibilities: editing.responsibilities.filter(Boolean),
      benefits: editing.benefits.filter(Boolean),
    }

    if (editing.id) {
      const { id, ...rest } = data
      await supabase.from('job_listings').update(rest).eq('id', id)
    } else {
      await supabase.from('job_listings').insert(data)
    }

    setSaving(false)
    setEditing(null)
    onRefresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    await supabase.from('job_listings').delete().eq('id', id)
    onRefresh()
  }

  const toggleActive = async (job: JobListing) => {
    await supabase.from('job_listings').update({ is_active: !job.is_active }).eq('id', job.id)
    onRefresh()
  }

  const updateArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    if (!editing) return
    const arr = [...editing[field]]
    arr[index] = value
    setEditing({ ...editing, [field]: arr })
  }

  const addArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    if (!editing) return
    setEditing({ ...editing, [field]: [...editing[field], ''] })
  }

  const removeArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    if (!editing) return
    setEditing({ ...editing, [field]: editing[field].filter((_, i) => i !== index) })
  }

  if (editing) {
    return (
      <div className="min-h-screen bg-surface">
        <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
              <ArrowLeft size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !editing.title || !editing.description}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={16} />
              {saving ? 'Saving...' : editing.id ? 'Update Listing' : 'Create Listing'}
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <h1 className="text-2xl font-bold text-white">{editing.id ? 'Edit' : 'New'} Job Listing</h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm text-white/60 mb-1 block">Job Title *</label>
              <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50" placeholder="e.g. Senior Digital Forensics Analyst" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Department</label>
              <input value={editing.department} onChange={e => setEditing({ ...editing, department: e.target.value })} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Location</label>
              <input value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Type</label>
              <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50">
                <option>Full-time</option><option>Part-time</option><option>Contract</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Experience Level</label>
              <select value={editing.experience_level} onChange={e => setEditing({ ...editing, experience_level: e.target.value })} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50">
                <option>Entry</option><option>Mid-Level</option><option>Senior</option><option>Lead</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-white/60 mb-1 block">Salary Range</label>
              <input value={editing.salary_range || ''} onChange={e => setEditing({ ...editing, salary_range: e.target.value })} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50" placeholder="e.g. $120,000 - $160,000" />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-white/60 mb-1 block">Description *</label>
              <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 resize-none" placeholder="Describe the role..." />
            </div>
          </div>

          {/* Array fields */}
          {(['requirements', 'responsibilities', 'benefits'] as const).map(field => (
            <div key={field}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-white/60 capitalize">{field}</label>
                <button onClick={() => addArrayItem(field)} className="text-xs text-primary hover:text-primary-light flex items-center gap-1"><Plus size={12} /> Add</button>
              </div>
              <div className="space-y-2">
                {editing[field].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={item} onChange={e => updateArrayField(field, i, e.target.value)} className="flex-1 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-primary/50" placeholder={`Add ${field.slice(0, -1)}...`} />
                    <button onClick={() => removeArrayItem(field, i)} className="p-2 text-white/20 hover:text-red-400 transition-colors"><X size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <label className="text-sm text-white/60">Active</label>
            <button
              onClick={() => setEditing({ ...editing, is_active: !editing.is_active })}
              className={`w-10 h-6 rounded-full transition-colors ${editing.is_active ? 'bg-primary' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${editing.is_active ? 'translate-x-4' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft size={18} />
            Back to Careers
          </button>
          <button
            onClick={() => setEditing({ ...emptyJob })}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Listing
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Manage Job Listings</h1>

        <div className="border border-white/[0.06] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase">Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-white font-medium">{job.title}</td>
                  <td className="px-4 py-3 text-sm text-white/50">{job.department}</td>
                  <td className="px-4 py-3 text-sm text-white/50">{job.experience_level}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${job.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleActive(job)} className="p-1.5 text-white/30 hover:text-white/60 transition-colors" title={job.is_active ? 'Deactivate' : 'Activate'}>
                        {job.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => setEditing({ ...job })} className="p-1.5 text-white/30 hover:text-primary transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(job.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
