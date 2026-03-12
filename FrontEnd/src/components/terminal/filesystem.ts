export interface FSNode {
  name: string
  type: 'file' | 'directory'
  content?: string
  permissions?: string
  owner?: string
  size?: number
  modified?: string
  children?: FSNode[]
}

function f(name: string, content: string, size?: number): FSNode {
  return { name, type: 'file', content, permissions: '-rw-r--r--', owner: 'guest', size: size ?? content.length, modified: '2026-03-11 10:00' }
}

function d(name: string, children: FSNode[]): FSNode {
  return { name, type: 'directory', permissions: 'drwxr-xr-x', owner: 'guest', size: 4096, modified: '2026-03-11 10:00', children }
}

// Root-owned file (only root can read)
function fRoot(name: string, content: string, size?: number): FSNode {
  return { name, type: 'file', content, permissions: '-rw-------', owner: 'root', size: size ?? content.length, modified: '2026-03-11 03:15' }
}

// Root-owned directory
function dRoot(name: string, children: FSNode[]): FSNode {
  return { name, type: 'directory', permissions: 'drwx------', owner: 'root', size: 4096, modified: '2026-03-11 03:15', children }
}

export const filesystem: FSNode = d('/', [
  d('home', [
    d('guest', [
      f('.bashrc', `# ~/.bashrc\nexport PS1="guest@coreit:\\w$ "\nexport PATH="/usr/bin:/usr/local/bin"\nalias ll="ls -la"\nalias cls="clear"\n`),
      f('.profile', `# ~/.profile\necho "Welcome to CoreIT Terminal"\n`),
      d('Documents', [
        f('notes.txt', `Meeting Notes - March 2026\n==========================\n- Discussed Q2 security roadmap\n- New firewall deployment for Nexus Financial\n- Data recovery project for Atlas Manufacturing\n- Budget review for EDR platform upgrade\n`),
        f('todo.txt', `TODO List\n=========\n[ ] Update firewall rules for client A\n[ ] Run penetration test on staging env\n[x] Complete incident report #2847\n[x] Deploy new IDS signatures\n[ ] Review security audit findings\n`),
        d('reports', [
          f('q1-2026.txt', `Q1 2026 Security Report\n========================\nIncidents handled: 47\nAvg response time: 12 min\nData recovered: 99.8%\nUptime: 99.97%\nNew clients onboarded: 23\n`),
          f('vulnerability-scan.txt', `Vulnerability Scan Results\n==========================\nDate: 2026-03-01\nTarget: 192.168.1.0/24\n\nCritical: 0\nHigh: 2 (patched)\nMedium: 5\nLow: 12\nInfo: 34\n\nStatus: PASS\n`),
        ]),
      ]),
      d('Downloads', [
        f('coreit-brochure.pdf', '[Binary file - 2.4MB PDF]', 2457600),
        f('network-diagram.png', '[Binary file - 847KB PNG]', 867328),
      ]),
      d('scripts', [
        f('backup.sh', `#!/bin/bash\n# CoreIT automated backup script\nDATE=$(date +%Y-%m-%d)\nBACKUP_DIR="/var/backups/$DATE"\n\nmkdir -p "$BACKUP_DIR"\ntar czf "$BACKUP_DIR/system.tar.gz" /etc /var/www\necho "Backup completed: $BACKUP_DIR/system.tar.gz"\n`),
        f('health-check.sh', `#!/bin/bash\n# System health check\necho "=== CoreIT Health Check ==="\necho "CPU: $(uptime)"\necho "Memory: $(free -h | head -2)"\necho "Disk: $(df -h / | tail -1)"\necho "Network: $(ip addr show eth0 | grep inet)"\necho "Firewall: active"\necho "Status: ALL SYSTEMS OPERATIONAL"\n`),
        f('scan.py', `#!/usr/bin/env python3\n"""CoreIT network scanner - safe mode"""\nimport socket\nimport sys\n\ndef scan_port(host, port):\n    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    sock.settimeout(1)\n    result = sock.connect_ex((host, port))\n    sock.close()\n    return result == 0\n\nif __name__ == "__main__":\n    host = sys.argv[1] if len(sys.argv) > 1 else "localhost"\n    print(f"Scanning {host}...")\n    for port in [22, 80, 443, 8080]:\n        status = "open" if scan_port(host, port) else "closed"\n        print(f"  Port {port}: {status}")\n`),
      ]),
    ]),
  ]),
  // /root - root-only home directory (CTF target)
  dRoot('root', [
    fRoot('flag.txt', `╔═══════════════════════════════════════════════╗
║                                               ║
║   FLAG{7h3_c0r3_h45_b33n_r00t3d}              ║
║                                               ║
║   Congratulations! You've rooted the system.  ║
║   But the real treasure lies deeper...        ║
║   Check ~/.recruitment/ for what's next.      ║
║                                               ║
╚═══════════════════════════════════════════════╝
`),
    fRoot('.bash_history', `cat /var/log/auth.log\nsu -\ncd /opt/coreit/config\ncat .maintenance\npasswd\nexit\n`),
    dRoot('.recruitment', [
      fRoot('README.md', `# You Found It.

If you made it here, you clearly know your way around a Linux system.

CoreIT is always looking for sharp security minds who can think
like an attacker and defend like a pro.

## Interested?

Visit the hidden careers page:

  >>> /join-cyber-ranger <<<

This URL won't show up in any navigation menu.
Only those who earn it get to see it.

Good luck, hacker.

- The CoreIT Red Team
`),
    ]),
  ]),
  d('etc', [
    f('hostname', 'coreit-workstation\n'),
    f('hosts', `127.0.0.1   localhost\n127.0.1.1   coreit-workstation\n192.168.1.1 gateway\n192.168.1.10 fileserver\n`),
    f('os-release', `NAME="CoreIT Linux"\nVERSION="2026.03"\nID=coreit\nPRETTY_NAME="CoreIT Linux 2026.03"\nHOME_URL="https://coreit.com"\n`),
    f('passwd', `root:x:0:0:root:/root:/bin/bash\nadmin:x:1001:1001:System Admin:/home/admin:/bin/bash\nguest:x:1000:1000:Guest User:/home/guest:/bin/bash\nnobody:x:65534:65534:Nobody:/nonexistent:/usr/sbin/nologin\n`),
    // /etc/shadow - root-only
    fRoot('shadow', `root:$6$rounds=656000$xyz...hashed:19427:0:99999:7:::\nadmin:$6$rounds=656000$abc...hashed:19427:0:99999:7:::\nguest:!:19427:0:99999:7:::\n`),
    f('motd', `\n  ╔══════════════════════════════════════════╗\n  ║   CoreIT Secure Workstation v2026.03     ║\n  ║   All activity is monitored and logged   ║\n  ╚══════════════════════════════════════════╝\n\n`),
    d('ssl', [
      f('openssl.cnf', '[ssl configuration - restricted]'),
    ]),
  ]),
  d('var', [
    d('log', [
      f('syslog', `Mar 11 09:00:01 coreit CRON[1234]: (root) CMD (/usr/bin/health-check)\nMar 11 09:15:23 coreit sshd[5678]: Accepted publickey for guest\nMar 11 09:30:00 coreit firewall[9012]: Rule updated: ALLOW 443/tcp\nMar 11 10:00:00 coreit backup[3456]: Backup completed successfully\nMar 11 10:05:12 coreit ids[7890]: No threats detected\n`),
      f('auth.log', `Mar 11 03:12:45 coreit su[9821]: Successful su for root by admin (uid=1001)
Mar 11 03:12:45 coreit su[9821]: + /dev/pts/2 admin:root
Mar 11 03:14:02 coreit su[9821]: pam_unix(su:session): session opened for user root
Mar 11 03:15:30 coreit sudo[9830]: admin : TTY=pts/2 ; PWD=/opt/coreit/config ; COMMAND=/bin/cat .maintenance
Mar 11 03:22:18 coreit su[9821]: pam_unix(su:session): session closed for user root
Mar 11 06:30:00 coreit sshd[1111]: Server listening on 0.0.0.0 port 22
Mar 11 08:55:00 coreit sshd[2222]: Failed password for root from 45.33.32.1 port 22 ssh2
Mar 11 08:55:03 coreit sshd[2222]: Failed password for root from 45.33.32.1 port 22 ssh2
Mar 11 08:55:05 coreit sshd[2222]: Connection closed by 45.33.32.1 port 22 [preauth]
Mar 11 09:15:23 coreit sshd[5678]: Accepted publickey for guest from 10.0.0.5
Mar 11 09:15:23 coreit sshd[5678]: pam_unix(sshd:session): session opened
`),
      f('firewall.log', `[2026-03-11 08:00] ALLOW TCP 192.168.1.50:443 -> 10.0.0.5:52341\n[2026-03-11 08:01] BLOCK TCP 45.33.32.1:22 -> 192.168.1.1:22 (brute-force)\n[2026-03-11 08:05] ALLOW UDP 192.168.1.50:53 -> 8.8.8.8:53\n[2026-03-11 09:30] RULE_UPDATE: Added ALLOW 443/tcp from 10.0.0.0/24\n`),
      d('sussy', [
        f('suspicious_image.jpg', '[JFIF binary image data - 56.3KB]', 57654),
      ]),
    ]),
    d('www', [
      f('index.html', `<!DOCTYPE html>\n<html>\n<head><title>CoreIT</title></head>\n<body>\n  <h1>CoreIT - Enterprise IT Solutions</h1>\n  <p>Secure. Protect. Recover.</p>\n</body>\n</html>\n`),
    ]),
  ]),
  d('usr', [
    d('bin', [
      f('python3', '[executable]', 5242880),
      f('node', '[executable]', 42991616),
      f('git', '[executable]', 3145728),
    ]),
    d('local', [
      d('bin', [
        f('coreit-cli', '[executable]', 1048576),
      ]),
    ]),
  ]),
  d('tmp', [
    f('scan-results.tmp', `Last scan: 2026-03-11 08:00:00\nClean: true\n`),
    // CTF breadcrumb: partial shadow backup
    f('.shadow.bak', `# Shadow backup - partial recovery from failed cron job
# Created: 2026-03-10 02:00:00
# NOTE: Full shadow file is in /etc/shadow (root only)
#
# admin password was reset during maintenance window
# Maintenance config stored in /opt/coreit/config/
# See .maintenance file for emergency access credentials
#
root:$6$rounds=656000$xyz...hashed:19427:0:99999:7:::
admin:$6$rounds=656000$abc...hashed:19427:0:99999:7:::
guest:!:19427:0:99999:7:::
`),
  ]),
  d('opt', [
    d('coreit', [
      f('VERSION', '2026.03.1\n'),
      f('LICENSE', `CoreIT Enterprise License\nLicensed to: Demo Environment\nExpires: 2027-03-11\nModules: firewall, forensics, recovery, network, antivirus, storage\n`),
      d('config', [
        f('firewall.yml', `# CoreIT Firewall Configuration\nrules:\n  - name: allow-https\n    port: 443\n    protocol: tcp\n    action: allow\n  - name: allow-ssh-internal\n    port: 22\n    protocol: tcp\n    source: 10.0.0.0/8\n    action: allow\n  - name: block-telnet\n    port: 23\n    protocol: tcp\n    action: deny\n    log: true\n`),
        f('monitoring.yml', `# CoreIT Monitoring\ninterval: 60s\nalerts:\n  - type: cpu\n    threshold: 90%\n  - type: memory\n    threshold: 85%\n  - type: disk\n    threshold: 90%\n  - type: network\n    threshold: 1Gbps\nnotify:\n  - email: ops@coreit.com\n  - slack: "#alerts"\n`),
        // CTF key: maintenance password
        f('.maintenance', `# CoreIT Emergency Maintenance Configuration
# Last updated: 2026-03-10 03:00:00
# Updated by: admin (uid=1001)
#
# WARNING: This file contains emergency access credentials.
# Do NOT share or expose this file.
# Rotate credentials after each maintenance window.
#
# Emergency root access:
root_override_pass=7h3-c0r3-1s-r00t3d
#
# Maintenance window: 2026-03-10 02:00 - 04:00 UTC
# Status: COMPLETED
# Actions performed:
#   - Updated shadow database
#   - Rotated SSL certificates
#   - Patched kernel (CVE-2026-1234)
#   - Backed up /etc/shadow to /tmp/.shadow.bak
`),
      ]),
    ]),
  ]),
  f('about.txt', `CoreIT - Enterprise IT Solutions & Security\n=============================================\nFounded to bridge the gap between enterprise security\nand small-to-medium business accessibility.\n\nWe deliver cutting-edge IT solutions and cybersecurity\nservices that protect your business, recover your data,\nand keep your infrastructure running at peak performance.\n\nContact: info@coreit.com | (555) 123-4567`),
  f('contact.txt', `Contact CoreIT\n================\nEmail:   info@coreit.com\nPhone:   (555) 123-4567\nAddress: 1234 Technology Drive, Suite 500\n         San Francisco, CA 94105\nHours:   Mon-Fri 8:00 AM - 6:00 PM`),
])

export function resolvePath(root: FSNode, cwd: string, target: string, home?: string): FSNode | null {
  const homeDir = home || '/home/guest'
  const expandedTarget = target.replace(/^~/, homeDir)

  const parts = expandedTarget.startsWith('/')
    ? expandedTarget.split('/').filter(Boolean)
    : [...cwd.split('/').filter(Boolean), ...expandedTarget.split('/').filter(Boolean)]

  const resolved: string[] = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }

  let current = root
  for (const part of resolved) {
    const child = current.children?.find((c) => c.name === part)
    if (!child) return null
    current = child
  }
  return current
}

export function getAbsolutePath(cwd: string, target: string, home?: string): string {
  const homeDir = home || '/home/guest'
  const expandedTarget = target.replace(/^~/, homeDir)

  if (expandedTarget.startsWith('/')) {
    const parts = expandedTarget.split('/').filter(Boolean)
    const resolved: string[] = []
    for (const part of parts) {
      if (part === '..') resolved.pop()
      else if (part !== '.') resolved.push(part)
    }
    return '/' + resolved.join('/')
  }

  const parts = [...cwd.split('/').filter(Boolean), ...expandedTarget.split('/').filter(Boolean)]
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }
  return '/' + resolved.join('/')
}

export function getAllFiles(node: FSNode, path: string = ''): string[] {
  const currentPath = path ? `${path}/${node.name}` : node.name
  if (node.type === 'file') return [currentPath]
  const results: string[] = []
  for (const child of node.children || []) {
    results.push(...getAllFiles(child, currentPath === '/' ? '' : currentPath))
  }
  return results
}
