-- CoreIT Job Listings Table
-- Run this in your Supabase SQL Editor

-- Create the job_listings table
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Remote',
  type TEXT NOT NULL DEFAULT 'Full-time', -- Full-time, Part-time, Contract
  experience_level TEXT NOT NULL DEFAULT 'Mid-Level', -- Entry, Mid-Level, Senior, Lead
  salary_range TEXT,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- Public read access for active listings
CREATE POLICY "Anyone can view active job listings"
  ON job_listings
  FOR SELECT
  USING (is_active = true);

-- Authenticated users with admin email can do everything
CREATE POLICY "Admin can manage all job listings"
  ON job_listings
  FOR ALL
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Seed with template forensics positions
INSERT INTO job_listings (title, department, location, type, experience_level, salary_range, description, requirements, responsibilities, benefits) VALUES
(
  'Senior Digital Forensics Analyst',
  'Cybersecurity',
  'San Francisco, CA (Hybrid)',
  'Full-time',
  'Senior',
  '$120,000 - $160,000',
  'Join our elite forensics team investigating complex cyber incidents for enterprise clients. You will lead forensic investigations, analyze malware, and provide expert testimony when needed.',
  ARRAY[
    '5+ years of digital forensics experience',
    'EnCE, GCFE, or GCFA certification required',
    'Expertise with EnCase, FTK, X-Ways, or Autopsy',
    'Strong knowledge of Windows, Linux, and macOS internals',
    'Experience with memory forensics (Volatility)',
    'Understanding of network forensics and packet analysis'
  ],
  ARRAY[
    'Lead forensic investigations for enterprise clients',
    'Perform disk, memory, and network forensic analysis',
    'Develop forensic reports and present findings',
    'Mentor junior analysts and develop team capabilities',
    'Maintain chain of custody and evidence handling procedures',
    'Collaborate with incident response teams during active breaches'
  ],
  ARRAY[
    'Competitive salary + performance bonus',
    'Health, dental, and vision insurance',
    'Unlimited PTO policy',
    '401(k) with 4% company match',
    'Annual conference and training budget ($5,000)',
    'Home office stipend'
  ]
),
(
  'Incident Response Specialist',
  'Cybersecurity',
  'Remote (US)',
  'Full-time',
  'Mid-Level',
  '$95,000 - $130,000',
  'Be the first responder to cyber incidents. You will triage alerts, contain threats, and coordinate remediation efforts across our client base. This role requires on-call rotation.',
  ARRAY[
    '3+ years in incident response or SOC operations',
    'GCIA, GCIH, or equivalent certification preferred',
    'Experience with SIEM platforms (Splunk, ELK, or similar)',
    'Knowledge of MITRE ATT&CK framework',
    'Strong scripting skills (Python, PowerShell, Bash)',
    'Familiarity with EDR tools (CrowdStrike, SentinelOne, Carbon Black)'
  ],
  ARRAY[
    'Respond to and contain active security incidents',
    'Perform root cause analysis and develop remediation plans',
    'Create detection rules and improve monitoring coverage',
    'Document incidents and maintain runbooks',
    'Participate in on-call rotation (1 week per month)',
    'Conduct threat hunting exercises across client environments'
  ],
  ARRAY[
    'Competitive salary + on-call compensation',
    'Health, dental, and vision insurance',
    'Flexible work schedule',
    '401(k) with 4% company match',
    'Certification reimbursement program',
    'Annual training budget ($3,000)'
  ]
),
(
  'Malware Reverse Engineer',
  'Cybersecurity',
  'San Francisco, CA (On-site)',
  'Full-time',
  'Senior',
  '$140,000 - $185,000',
  'Analyze sophisticated malware samples, develop signatures, and support incident response efforts. This role is ideal for someone passionate about understanding how adversaries operate at a technical level.',
  ARRAY[
    '4+ years in malware analysis or reverse engineering',
    'GREM certification or equivalent experience',
    'Proficiency with IDA Pro, Ghidra, or Binary Ninja',
    'Strong understanding of x86/x64 assembly',
    'Experience with both static and dynamic analysis techniques',
    'Familiarity with common malware families and TTPs'
  ],
  ARRAY[
    'Reverse engineer malware samples from client incidents',
    'Develop YARA rules and detection signatures',
    'Create detailed technical analysis reports',
    'Support incident response with real-time malware triage',
    'Research emerging threats and attack techniques',
    'Build and maintain sandbox analysis infrastructure'
  ],
  ARRAY[
    'Top-tier compensation package',
    'Health, dental, and vision insurance',
    'Unlimited PTO policy',
    '401(k) with 4% company match',
    'Dedicated research time (20% of work hours)',
    'Conference speaker sponsorship program'
  ]
),
(
  'Junior Forensics Analyst',
  'Cybersecurity',
  'Remote (US)',
  'Full-time',
  'Entry',
  '$70,000 - $90,000',
  'Start your career in digital forensics. You will work alongside senior analysts, learning investigation techniques while contributing to real client cases. Ideal for recent graduates with a passion for cybersecurity.',
  ARRAY[
    'Bachelor''s degree in Cybersecurity, CS, or related field',
    'CompTIA Security+ or equivalent (or willingness to obtain within 6 months)',
    'Basic understanding of digital forensics concepts',
    'Familiarity with Linux command line',
    'Strong analytical and problem-solving skills',
    'Excellent written communication'
  ],
  ARRAY[
    'Assist senior analysts with forensic investigations',
    'Perform evidence collection and preservation',
    'Analyze log files and system artifacts',
    'Draft sections of forensic reports',
    'Maintain forensic lab equipment and tools',
    'Participate in training exercises and CTF competitions'
  ],
  ARRAY[
    'Competitive entry-level salary',
    'Health, dental, and vision insurance',
    'Structured mentorship program',
    '401(k) with 4% company match',
    'Full certification sponsorship (GCFE, EnCE)',
    'Annual training budget ($3,000)'
  ]
),
(
  'Threat Intelligence Analyst',
  'Cybersecurity',
  'San Francisco, CA (Hybrid)',
  'Full-time',
  'Mid-Level',
  '$100,000 - $140,000',
  'Track advanced persistent threats and provide actionable intelligence to our clients. You will monitor the threat landscape, produce intelligence reports, and integrate findings into our detection capabilities.',
  ARRAY[
    '3+ years in threat intelligence or security research',
    'GCTI certification or equivalent experience preferred',
    'Experience with threat intelligence platforms (MISP, OpenCTI, ThreatConnect)',
    'Strong understanding of geopolitical cyber threat landscape',
    'Proficiency in OSINT techniques and tools',
    'Experience with STIX/TAXII frameworks'
  ],
  ARRAY[
    'Monitor and analyze emerging cyber threats',
    'Produce strategic and tactical intelligence reports',
    'Track threat actor TTPs and campaigns',
    'Integrate intelligence into detection and response workflows',
    'Brief clients on relevant threats to their industry',
    'Collaborate with forensics and IR teams on active cases'
  ],
  ARRAY[
    'Competitive salary + performance bonus',
    'Health, dental, and vision insurance',
    'Flexible hybrid work arrangement',
    '401(k) with 4% company match',
    'Annual conference attendance (Black Hat, DEF CON)',
    'Dedicated research and publication time'
  ]
);
