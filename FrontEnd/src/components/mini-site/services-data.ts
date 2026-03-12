import type { Service } from '../../types'

export const services: Service[] = [
  {
    slug: 'firewall-standup',
    title: 'Firewall Standup',
    tagline: 'Enterprise-grade perimeter defense',
    description:
      'Deploy and configure next-generation firewalls to protect your network from unauthorized access, malware, and cyber threats. Our team handles everything from initial assessment to deployment and ongoing management.',
    features: [
      'Next-gen firewall deployment & configuration',
      'Intrusion detection & prevention (IDS/IPS)',
      'VPN setup & management',
      'Traffic analysis & rule optimization',
      'Real-time threat monitoring',
      '24/7 incident response',
    ],
    icon: 'Shield',
  },
  {
    slug: 'forensics',
    title: 'Digital Forensics',
    tagline: 'Investigate. Analyze. Resolve.',
    description:
      'When a breach occurs, every second counts. Our certified forensic analysts investigate security incidents, preserve digital evidence, and provide detailed reports for legal proceedings and remediation planning.',
    features: [
      'Incident response & containment',
      'Digital evidence preservation',
      'Malware analysis & reverse engineering',
      'Chain of custody documentation',
      'Expert witness testimony',
      'Post-incident remediation planning',
    ],
    icon: 'Search',
  },
  {
    slug: 'data-recovery',
    title: 'Data Recovery',
    tagline: 'Your data, recovered.',
    description:
      'Lost critical data? Our data recovery specialists use advanced techniques to retrieve data from failed hard drives, corrupted RAID arrays, damaged SSDs, and compromised servers with industry-leading success rates.',
    features: [
      'Hard drive & SSD recovery',
      'RAID array reconstruction',
      'Ransomware data restoration',
      'Cloud backup recovery',
      'Database repair & recovery',
      'Emergency 24-hour turnaround',
    ],
    icon: 'HardDrive',
  },
  {
    slug: 'network-infrastructure',
    title: 'Network Infrastructure',
    tagline: 'Built for performance & reliability',
    description:
      'Design, deploy, and manage robust network infrastructure that scales with your business. From small office setups to enterprise data centers, we build networks that are fast, secure, and resilient.',
    features: [
      'Network design & architecture',
      'Switching & routing deployment',
      'Wireless network solutions',
      'Network monitoring & management',
      'Performance optimization',
      'Disaster recovery planning',
    ],
    icon: 'Network',
  },
  {
    slug: 'antivirus-solutions',
    title: 'Antivirus Solutions',
    tagline: 'Comprehensive antivirus and malware protection',
    description:
      'Protect every endpoint in your organization with enterprise antivirus solutions. We deploy, configure, and manage advanced endpoint protection platforms that stop threats before they impact your business.',
    features: [
      'Endpoint detection & response (EDR)',
      'Real-time malware scanning',
      'Zero-day threat protection',
      'Centralized management console',
      'Automated patch management',
      'Security awareness training',
    ],
    icon: 'Bug',
  },
  {
    slug: 'storage-solutions',
    title: 'Storage Solutions',
    tagline: 'Scalable storage infrastructure and management',
    description:
      'Design and implement scalable storage solutions that grow with your business. From NAS and SAN deployments to cloud-hybrid storage architectures, we ensure your data is always accessible, secure, and backed up.',
    features: [
      'NAS & SAN deployment',
      'Cloud-hybrid storage architecture',
      'Storage virtualization',
      'Data deduplication & compression',
      'Automated backup scheduling',
      'Disaster recovery storage',
    ],
    icon: 'Database',
  },
]
