import { filesystem, resolvePath, getAbsolutePath, type FSNode } from './filesystem'

export type SessionFiles = Record<string, string>

export interface CommandResult {
  output: string[]
  newCwd?: string
  newEnv?: Record<string, string>
  newSessionFiles?: SessionFiles
  pendingAuth?: { type: 'su'; targetUser: string }
}

type Env = Record<string, string>

// ANSI color helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}K`
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`
}

function formatPermissions(node: FSNode): string {
  return node.permissions || (node.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--')
}

function readOnly(cmd: string): CommandResult {
  return { output: [`${c.red}${cmd}: read-only file system${c.reset}`] }
}

function permDenied(cmd: string, target?: string): CommandResult {
  return { output: [`${c.red}${cmd}: ${target ? target + ': ' : ''}Permission denied${c.reset}`] }
}

function blocked(cmd: string): CommandResult {
  return { output: [
    `${c.red}${cmd}: operation blocked${c.reset}`,
    `${c.yellow}This is a sandboxed terminal environment.${c.reset}`,
    `${c.yellow}Network and system operations are disabled for security.${c.reset}`,
  ] }
}

// Permission check: /root/ and /etc/shadow are root-only
function checkPerm(absPath: string, env: Env): boolean {
  if ((absPath === '/root' || absPath.startsWith('/root/')) && env.USER !== 'root') return false
  if (absPath === '/etc/shadow' && env.USER !== 'root') return false
  return true
}

// Validate su authentication
export function validateAuth(
  auth: { type: 'su'; targetUser: string },
  password: string,
  env: Env
): { success: boolean; newEnv?: Env; newCwd?: string; output: string[] } {
  if (auth.type === 'su' && auth.targetUser === 'root') {
    if (password === '7h3-c0r3-1s-r00t3d') {
      return {
        success: true,
        newEnv: { ...env, USER: 'root', HOME: '/root', PS1: 'root@coreit:\\w# ', LOGNAME: 'root' },
        newCwd: '/root',
        output: [],
      }
    }
    return { success: false, output: [`${c.red}su: Authentication failure${c.reset}`] }
  }
  return { success: false, output: ['Authentication error'] }
}

// ── Command handlers ──────────────────────────────────────────────

type CmdFn = (args: string[], cwd: string, env: Env, sessionFiles: SessionFiles) => CommandResult

// Helper to resolve a file: check session files first, then static filesystem
function resolveFile(cwd: string, target: string, sessionFiles: SessionFiles, home = '/home/guest'): { content: string; name: string; isSession: boolean } | null {
  const absPath = getAbsolutePath(cwd, target, home)
  if (sessionFiles[absPath]) {
    return { content: sessionFiles[absPath], name: target.split('/').pop() || target, isSession: true }
  }
  const node = resolvePath(filesystem, cwd, target, home)
  if (node && node.type === 'file') {
    return { content: node.content || '', name: node.name, isSession: false }
  }
  return null
}

const cmds: Record<string, CmdFn> = {

  // ── Navigation & listing ──────────────────────────────────────

  ls: (args, cwd, env, sessionFiles) => {
    const home = env.HOME || '/home/guest'
    const flags = args.filter(a => a.startsWith('-')).join('')
    const target = args.find(a => !a.startsWith('-')) || '.'
    const showAll = flags.includes('a')
    const showLong = flags.includes('l')

    const absPath = getAbsolutePath(cwd, target, home)
    if (!checkPerm(absPath, env)) return permDenied('ls', `'${target}'`)

    const node = resolvePath(filesystem, cwd, target, home)
    if (!node) return { output: [`ls: cannot access '${target}': No such file or directory`] }
    if (node.type === 'file') {
      if (showLong) {
        return { output: [`${formatPermissions(node)} 1 ${node.owner || 'guest'} guest ${String(node.size ?? 0).padStart(8)} ${node.modified || ''} ${node.name}`] }
      }
      return { output: [node.name] }
    }

    let entries = node.children || []
    if (!showAll) entries = entries.filter(e => !e.name.startsWith('.'))

    // Collect session file names in this directory
    const dirPath = absPath.replace(/\/$/, '')
    const sessionFileNames: string[] = []
    const staticNames = new Set(entries.map(e => e.name))
    for (const sfPath of Object.keys(sessionFiles)) {
      const parts = sfPath.split('/')
      const sfName = parts.pop() || ''
      const sfDir = parts.join('/') || '/'
      if (sfDir === dirPath && sfName && !staticNames.has(sfName)) {
        sessionFileNames.push(sfName)
      }
    }

    if (entries.length === 0 && sessionFileNames.length === 0 && !showAll) return { output: [] }

    if (showLong) {
      const lines = [`total ${entries.length + sessionFileNames.length}`]
      if (showAll) {
        lines.push(`${c.blue}drwxr-xr-x${c.reset} 2 guest guest     4096 2026-03-11 10:00 ${c.blue}.${c.reset}`)
        lines.push(`${c.blue}drwxr-xr-x${c.reset} 2 guest guest     4096 2026-03-11 10:00 ${c.blue}..${c.reset}`)
      }
      for (const child of entries) {
        const perm = formatPermissions(child)
        const size = String(child.size ?? (child.type === 'directory' ? 4096 : 0)).padStart(8)
        const mod = child.modified || '2026-03-11 10:00'
        const name = child.type === 'directory'
          ? `${c.blue}${child.name}/${c.reset}`
          : child.name.endsWith('.sh') || child.name.endsWith('.py')
            ? `${c.green}${child.name}${c.reset}`
            : child.name
        lines.push(`${perm} 1 ${child.owner || 'guest'} guest ${size} ${mod} ${name}`)
      }
      for (const sfName of sessionFileNames) {
        lines.push(`-rw-r--r-- 1 guest guest        0 2026-03-12 00:00 ${c.yellow}${sfName}${c.reset}`)
      }
      return { output: lines }
    }

    const output = entries.map(child =>
      child.type === 'directory'
        ? `${c.blue}${child.name}/${c.reset}`
        : child.name.endsWith('.sh') || child.name.endsWith('.py')
          ? `${c.green}${child.name}${c.reset}`
          : child.name
    )
    for (const sfName of sessionFileNames) {
      output.push(`${c.yellow}${sfName}${c.reset}`)
    }
    return { output }
  },

  cd: (args, cwd, env) => {
    const home = env.HOME || '/home/guest'
    const target = args[0]
    if (!target || target === '~') return { output: [], newCwd: home }

    const node = resolvePath(filesystem, cwd, target, home)
    if (!node) return { output: [`cd: no such file or directory: ${target}`] }
    if (node.type !== 'directory') return { output: [`cd: not a directory: ${target}`] }

    const absPath = getAbsolutePath(cwd, target, home)
    if (!checkPerm(absPath, env)) return permDenied('cd', target)

    return { output: [], newCwd: absPath }
  },

  pwd: (_a, cwd) => ({ output: [cwd] }),

  // ── File reading ──────────────────────────────────────────────

  cat: (args, cwd, env, sessionFiles) => {
    const home = env.HOME || '/home/guest'
    if (!args.length) return { output: ['cat: missing file operand'] }
    const lines: string[] = []
    for (const target of args) {
      const absPath = getAbsolutePath(cwd, target, home)
      if (!checkPerm(absPath, env)) { lines.push(`${c.red}cat: ${target}: Permission denied${c.reset}`); continue }
      const file = resolveFile(cwd, target, sessionFiles, home)
      if (file) {
        lines.push(...file.content.split('\n'))
        continue
      }
      const node = resolvePath(filesystem, cwd, target, home)
      if (!node) { lines.push(`cat: ${target}: No such file or directory`); continue }
      if (node.type === 'directory') { lines.push(`cat: ${target}: Is a directory`); continue }
      lines.push(...(node.content || '').split('\n'))
    }
    return { output: lines }
  },

  head: (args, cwd, env) => {
    const home = env.HOME || '/home/guest'
    let n = 10
    const filtered: string[] = []
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[++i]) || 10 }
      else if (args[i].startsWith('-') && !isNaN(parseInt(args[i].slice(1)))) { n = parseInt(args[i].slice(1)) }
      else filtered.push(args[i])
    }
    if (!filtered.length) return { output: ['head: missing file operand'] }
    const absPath = getAbsolutePath(cwd, filtered[0], home)
    if (!checkPerm(absPath, env)) return permDenied('head', filtered[0])
    const node = resolvePath(filesystem, cwd, filtered[0], home)
    if (!node) return { output: [`head: cannot open '${filtered[0]}': No such file or directory`] }
    if (node.type === 'directory') return { output: [`head: error reading '${filtered[0]}': Is a directory`] }
    return { output: (node.content || '').split('\n').slice(0, n) }
  },

  tail: (args, cwd, env) => {
    const home = env.HOME || '/home/guest'
    let n = 10
    const filtered: string[] = []
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[++i]) || 10 }
      else if (args[i].startsWith('-') && !isNaN(parseInt(args[i].slice(1)))) { n = parseInt(args[i].slice(1)) }
      else filtered.push(args[i])
    }
    if (!filtered.length) return { output: ['tail: missing file operand'] }
    const absPath = getAbsolutePath(cwd, filtered[0], home)
    if (!checkPerm(absPath, env)) return permDenied('tail', filtered[0])
    const node = resolvePath(filesystem, cwd, filtered[0], home)
    if (!node) return { output: [`tail: cannot open '${filtered[0]}': No such file or directory`] }
    if (node.type === 'directory') return { output: [`tail: error reading '${filtered[0]}': Is a directory`] }
    const all = (node.content || '').split('\n')
    return { output: all.slice(-n) }
  },

  less: (args, cwd, env, sf) => cmds.cat(args, cwd, env, sf),
  more: (args, cwd, env, sf) => cmds.cat(args, cwd, env, sf),

  // ── Search & find ─────────────────────────────────────────────

  grep: (args, cwd, env) => {
    const home = env.HOME || '/home/guest'
    let ignoreCase = false
    let showLine = false
    let countOnly = false
    const filtered: string[] = []
    for (const a of args) {
      if (a === '-i') ignoreCase = true
      else if (a === '-n') showLine = true
      else if (a === '-c') countOnly = true
      else if (a.startsWith('-') && /^-[inc]+$/.test(a)) {
        if (a.includes('i')) ignoreCase = true
        if (a.includes('n')) showLine = true
        if (a.includes('c')) countOnly = true
      } else filtered.push(a)
    }
    if (filtered.length < 2) return { output: ['Usage: grep [OPTIONS] PATTERN FILE'] }
    const pattern = filtered[0]
    const target = filtered[1]
    const absPath = getAbsolutePath(cwd, target, home)
    if (!checkPerm(absPath, env)) return permDenied('grep', target)
    const node = resolvePath(filesystem, cwd, target, home)
    if (!node) return { output: [`grep: ${target}: No such file or directory`] }
    if (node.type === 'directory') return { output: [`grep: ${target}: Is a directory`] }

    const regex = new RegExp(pattern, ignoreCase ? 'i' : '')
    const lines = (node.content || '').split('\n')
    const matches: string[] = []
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        if (countOnly) continue
        const highlighted = lines[i].replace(new RegExp(`(${pattern})`, ignoreCase ? 'gi' : 'g'), `${c.red}$1${c.reset}`)
        matches.push(showLine ? `${c.green}${i + 1}${c.reset}:${highlighted}` : highlighted)
      }
    }
    if (countOnly) {
      const count = lines.filter(l => regex.test(l)).length
      return { output: [String(count)] }
    }
    return { output: matches.length ? matches : [] }
  },

  find: (args, cwd, env) => {
    const home = env.HOME || '/home/guest'
    const startDir = args.find(a => !a.startsWith('-') && a !== '-name' && a !== '-type') || '.'
    let namePattern = ''
    let typeFilter = ''
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && args[i + 1]) namePattern = args[++i]
      if (args[i] === '-type' && args[i + 1]) typeFilter = args[++i]
    }

    const node = resolvePath(filesystem, cwd, startDir, home)
    if (!node) return { output: [`find: '${startDir}': No such file or directory`] }

    const results: string[] = []
    const basePath = getAbsolutePath(cwd, startDir, home)

    function walk(n: FSNode, path: string) {
      const currentPath = path === '/' ? `/${n.name}` : n.name === '/' ? '/' : `${path}/${n.name}`
      const displayPath = n === node ? basePath : currentPath

      // Permission check: show error for restricted dirs
      if (!checkPerm(displayPath, env)) {
        results.push(`${c.red}find: '${displayPath}': Permission denied${c.reset}`)
        return
      }

      if (typeFilter === 'f' && n.type !== 'file') { /* skip */ }
      else if (typeFilter === 'd' && n.type !== 'directory') { /* skip */ }
      else if (namePattern) {
        const regex = new RegExp('^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
        if (regex.test(n.name)) results.push(displayPath)
      } else {
        results.push(displayPath)
      }
      if (n.children) {
        for (const child of n.children) walk(child, displayPath === '/' ? '' : displayPath)
      }
    }
    walk(node, basePath === '/' ? '' : basePath.split('/').slice(0, -1).join('/') || '/')
    return { output: results }
  },

  wc: (args, cwd) => {
    const target = args.find(a => !a.startsWith('-'))
    if (!target) return { output: ['wc: missing file operand'] }
    const node = resolvePath(filesystem, cwd, target)
    if (!node) return { output: [`wc: ${target}: No such file or directory`] }
    if (node.type === 'directory') return { output: [`wc: ${target}: Is a directory`] }
    const content = node.content || ''
    const lines = content.split('\n').length
    const words = content.split(/\s+/).filter(Boolean).length
    const chars = content.length
    return { output: [`  ${lines}  ${words} ${chars} ${target}`] }
  },

  // ── System info ───────────────────────────────────────────────

  whoami: (_args, _cwd, env) => ({ output: [env.USER || 'guest'] }),

  id: (_args, _cwd, env) => {
    if (env.USER === 'root') {
      return { output: ['uid=0(root) gid=0(root) groups=0(root)'] }
    }
    return { output: ['uid=1000(guest) gid=1000(guest) groups=1000(guest),27(sudo)'] }
  },

  hostname: () => ({ output: ['coreit-workstation'] }),

  uname: (args) => {
    const flags = args.join('')
    if (flags.includes('a')) return { output: ['CoreIT Linux 6.8.0-coreit x86_64 GNU/Linux'] }
    if (flags.includes('r')) return { output: ['6.8.0-coreit'] }
    if (flags.includes('m')) return { output: ['x86_64'] }
    return { output: ['CoreIT Linux'] }
  },

  date: () => {
    const now = new Date()
    return { output: [now.toString()] }
  },

  uptime: () => ({ output: [' 10:05:12 up 47 days, 3:22, 1 user, load average: 0.12, 0.08, 0.05'] }),

  // ── Environment ───────────────────────────────────────────────

  echo: (args, _cwd, env) => {
    const text = args.join(' ').replace(/\$(\w+)/g, (_, key) => env[key] || '')
    return { output: [text] }
  },

  env: (_a, _c, env) => ({ output: Object.entries(env).map(([k, v]) => `${k}=${v}`) }),
  printenv: (_a, _c, env) => ({ output: Object.entries(env).map(([k, v]) => `${k}=${v}`) }),

  export: (args, _c, env) => {
    const newEnv = { ...env }
    for (const arg of args) {
      const eq = arg.indexOf('=')
      if (eq > 0) {
        newEnv[arg.slice(0, eq)] = arg.slice(eq + 1).replace(/^["']|["']$/g, '')
      }
    }
    return { output: [], newEnv }
  },

  which: (args) => {
    const known: Record<string, string> = {
      ls: '/usr/bin/ls', cd: '(shell builtin)', cat: '/usr/bin/cat', grep: '/usr/bin/grep',
      find: '/usr/bin/find', python3: '/usr/bin/python3', node: '/usr/bin/node',
      git: '/usr/bin/git', bash: '/bin/bash', 'coreit-cli': '/usr/local/bin/coreit-cli',
      su: '/usr/bin/su', sudo: '/usr/bin/sudo',
    }
    const cmd = args[0]
    if (!cmd) return { output: ['Usage: which COMMAND'] }
    return { output: [known[cmd] || `${cmd} not found`] }
  },

  // ── File info ─────────────────────────────────────────────────

  file: (args, cwd, env, sessionFiles) => {
    const home = env.HOME || '/home/guest'
    const target = args[0]
    if (!target) return { output: ['Usage: file FILENAME'] }
    const absPath = getAbsolutePath(cwd, target, home)
    if (!checkPerm(absPath, env)) return permDenied('file', target)
    // Check session files
    if (sessionFiles[absPath]) {
      if (target.endsWith('.gz')) return { output: [`${target}: gzip compressed data`] }
      return { output: [`${target}: ASCII text`] }
    }
    const node = resolvePath(filesystem, cwd, target, home)
    if (!node) return { output: [`file: ${target}: No such file or directory`] }
    if (node.type === 'directory') return { output: [`${target}: directory`] }
    if (node.name.endsWith('.sh')) return { output: [`${target}: Bourne-Again shell script, ASCII text executable`] }
    if (node.name.endsWith('.py')) return { output: [`${target}: Python script, UTF-8 Unicode text executable`] }
    if (node.name.endsWith('.pdf')) return { output: [`${target}: PDF document`] }
    if (node.name.endsWith('.png')) return { output: [`${target}: PNG image data`] }
    if (node.name.endsWith('.jpg')) return { output: [`${target}: JPEG image data, JFIF standard 1.01`] }
    if (node.name.endsWith('.html')) return { output: [`${target}: HTML document, ASCII text`] }
    if (node.name.endsWith('.yml') || node.name.endsWith('.yaml')) return { output: [`${target}: YAML configuration file`] }
    if (node.content?.startsWith('[executable]')) return { output: [`${target}: ELF 64-bit LSB executable, x86-64`] }
    return { output: [`${target}: ASCII text`] }
  },

  du: (args, cwd) => {
    const flags = args.filter(a => a.startsWith('-')).join('')
    const target = args.find(a => !a.startsWith('-')) || '.'
    const human = flags.includes('h')
    const node = resolvePath(filesystem, cwd, target)
    if (!node) return { output: [`du: cannot access '${target}': No such file or directory`] }

    function getSize(n: FSNode): number {
      if (n.type === 'file') return n.size ?? (n.content?.length ?? 0)
      return (n.children || []).reduce((acc, child) => acc + getSize(child), 4096)
    }
    const size = getSize(node)
    return { output: [`${human ? formatSize(size) : size}\t${target}`] }
  },

  df: (args) => {
    const human = args.includes('-h')
    if (human) {
      return { output: [
        'Filesystem      Size  Used Avail Use% Mounted on',
        '/dev/sda1        50G   12G   35G  26% /',
        'tmpfs           3.9G  1.2M  3.9G   1% /tmp',
        '/dev/sda2       200G   45G  145G  24% /home',
      ] }
    }
    return { output: [
      'Filesystem     1K-blocks     Used Available Use% Mounted on',
      '/dev/sda1       52428800 12582912  36700160  26% /',
      'tmpfs            4096000     1228   4094772   1% /tmp',
      '/dev/sda2      209715200 47185920 152428544  24% /home',
    ] }
  },

  free: (args) => {
    if (args.includes('-h')) {
      return { output: [
        '               total        used        free      shared  buff/cache   available',
        'Mem:           7.8Gi       2.1Gi       3.4Gi       256Mi       2.3Gi       5.2Gi',
        'Swap:          2.0Gi          0B       2.0Gi',
      ] }
    }
    return { output: [
      '               total        used        free      shared  buff/cache   available',
      'Mem:         8142848     2202624     3565568      262144     2374656     5464064',
      'Swap:        2097152           0     2097152',
    ] }
  },

  // ── Process info ──────────────────────────────────────────────

  ps: (args) => {
    const flag = args[0] || ''
    if (flag === 'aux' || flag === '-ef') {
      return { output: [
        'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
        'root         1  0.0  0.1  16904  5120 ?        Ss   Mar10   0:03 /sbin/init',
        'root        42  0.0  0.2  28784  8192 ?        Ss   Mar10   0:01 /usr/sbin/sshd',
        'root       156  0.0  0.1  19280  4096 ?        Ss   Mar10   0:05 /usr/sbin/cron',
        'root       203  0.1  0.3  45872 12288 ?        Sl   Mar10   0:42 /opt/coreit/bin/firewall',
        'root       287  0.0  0.2  34560  8192 ?        Sl   Mar10   0:15 /opt/coreit/bin/ids',
        'root       312  0.0  0.1  22144  6144 ?        S    Mar10   0:08 /opt/coreit/bin/monitor',
        'guest     1000  0.0  0.1  10240  3072 pts/0    Ss   09:15   0:00 -bash',
        'guest     1234  0.0  0.0   8960  2048 pts/0    R+   10:05   0:00 ps aux',
      ] }
    }
    return { output: [
      '  PID TTY          TIME CMD',
      ' 1000 pts/0    00:00:00 bash',
      ' 1234 pts/0    00:00:00 ps',
    ] }
  },

  top: () => ({
    output: [
      `${c.bold}top - 10:05:12 up 47 days, 3:22, 1 user, load average: 0.12, 0.08, 0.05${c.reset}`,
      'Tasks:   8 total,   1 running,   7 sleeping,   0 stopped,   0 zombie',
      '%Cpu(s):  2.3 us,  0.8 sy,  0.0 ni, 96.5 id,  0.2 wa,  0.0 hi,  0.2 si',
      'MiB Mem:   7952.0 total,   3481.6 free,   2151.0 used,   2319.4 buff/cache',
      '',
      `${c.bold}  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND${c.reset}`,
      '  203 root      20   0   45872  12288   8192 S   0.3   0.3   0:42.15 firewall',
      '  312 root      20   0   22144   6144   4096 S   0.1   0.1   0:08.33 monitor',
      '  287 root      20   0   34560   8192   5120 S   0.0   0.2   0:15.67 ids',
      ' 1000 guest     20   0   10240   3072   2560 S   0.0   0.1   0:00.05 bash',
      '',
      `${c.gray}(snapshot mode - press q to quit in real terminal)${c.reset}`,
    ]
  }),

  // ── Network (sandboxed) ───────────────────────────────────────

  ifconfig: () => ({
    output: [
      'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500',
      '        inet 192.168.1.50  netmask 255.255.255.0  broadcast 192.168.1.255',
      '        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>',
      '        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)',
      '        RX packets 284592  bytes 198234567 (189.0 MiB)',
      '        TX packets 176234  bytes 24567890 (23.4 MiB)',
      '',
      'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536',
      '        inet 127.0.0.1  netmask 255.0.0.0',
    ]
  }),

  ip: (args) => {
    if (args[0] === 'addr' || args[0] === 'a') {
      return { output: [
        '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
        '    inet 127.0.0.1/8 scope host lo',
        '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
        '    inet 192.168.1.50/24 brd 192.168.1.255 scope global eth0',
      ] }
    }
    if (args[0] === 'route' || args[0] === 'r') {
      return { output: [
        'default via 192.168.1.1 dev eth0 proto dhcp metric 100',
        '192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50',
      ] }
    }
    return { output: ['Usage: ip [addr|route]'] }
  },

  ping: (args) => {
    const host = args.find(a => !a.startsWith('-'))
    if (!host) return { output: ['Usage: ping HOST'] }
    return { output: [
      `PING ${host} (${host === 'localhost' ? '127.0.0.1' : '93.184.' + Math.floor(Math.random() * 255) + '.1'}) 56(84) bytes of data.`,
      `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.${Math.floor(Math.random() * 90 + 10)} ms`,
      `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.${Math.floor(Math.random() * 90 + 10)} ms`,
      `64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.${Math.floor(Math.random() * 90 + 10)} ms`,
      '',
      `--- ${host} ping statistics ---`,
      '3 packets transmitted, 3 received, 0% packet loss, time 2003ms',
    ] }
  },

  curl: (args) => {
    const url = args.find(a => !a.startsWith('-'))
    if (!url) return { output: ['curl: try \'curl --help\' for more information'] }
    return { output: [
      `${c.yellow}Sandboxed environment: actual HTTP requests are disabled.${c.reset}`,
      `${c.gray}curl: (7) Couldn't connect to server${c.reset}`,
    ] }
  },

  wget: () => blocked('wget'),
  ssh: () => blocked('ssh'),
  scp: () => blocked('scp'),
  nmap: () => blocked('nmap'),
  nc: () => blocked('nc'),
  netcat: () => blocked('netcat'),
  telnet: () => blocked('telnet'),

  // ── Forensics / CTF commands ─────────────────────────────────

  binwalk: (args, cwd) => {
    const target = args.find(a => !a.startsWith('-'))
    if (!target) return { output: ['Usage: binwalk [OPTIONS] FILE'] }
    const node = resolvePath(filesystem, cwd, target)
    if (!node) return { output: [`binwalk: ${target}: No such file or directory`] }
    if (node.type === 'directory') return { output: [`binwalk: ${target}: Is a directory`] }

    // Special handling for the sussy image
    if (node.name === 'suspicious_image.jpg') {
      return { output: [
        '',
        `${c.bold}DECIMAL       HEXADECIMAL     DESCRIPTION${c.reset}`,
        '--------------------------------------------------------------------------------',
        `0             0x0             JPEG image data, JFIF standard 1.01`,
        `${c.green}45056         0xB000          gzip compressed data, from Unix, last modified: 2026-03-11 08:00:00${c.reset}`,
        `57654         0xE136          End of JPEG image`,
        '',
      ] }
    }
    return { output: [
      '',
      `${c.bold}DECIMAL       HEXADECIMAL     DESCRIPTION${c.reset}`,
      '--------------------------------------------------------------------------------',
      `0             0x0             ${node.name.endsWith('.jpg') ? 'JPEG image data' : node.name.endsWith('.png') ? 'PNG image' : 'data'}`,
      '',
    ] }
  },

  dd: (args, cwd) => {
    let ifPath = '', ofPath = '', bs = 1, skip = 0
    for (const arg of args) {
      if (arg.startsWith('if=')) ifPath = arg.slice(3)
      else if (arg.startsWith('of=')) ofPath = arg.slice(3)
      else if (arg.startsWith('bs=')) bs = parseInt(arg.slice(3)) || 1
      else if (arg.startsWith('skip=')) skip = parseInt(arg.slice(5)) || 0
    }
    if (!ifPath || !ofPath) return { output: ['Usage: dd if=INPUT of=OUTPUT [bs=N] [skip=N]'] }

    const node = resolvePath(filesystem, cwd, ifPath)
    if (!node) return { output: [`dd: failed to open '${ifPath}': No such file or directory`] }

    // Special handling: extracting gzip from the sussy image
    const byteOffset = skip * bs
    if (node.name === 'suspicious_image.jpg' && byteOffset === 45056) {
      const absOutPath = getAbsolutePath(cwd, ofPath)
      const extractedBytes = 57654 - 45056
      return {
        output: [
          `${extractedBytes}+0 records in`,
          `${extractedBytes}+0 records out`,
          `${extractedBytes} bytes (${(extractedBytes / 1024).toFixed(1)} KB) copied`,
        ],
        newSessionFiles: { [absOutPath]: '__GZIP_CTF_PAYLOAD__' },
      }
    }

    return { output: [
      `${c.yellow}dd: operation completed (simulated)${c.reset}`,
      `${c.gray}Note: write operations create temporary session files only${c.reset}`,
    ] }
  },

  gzip: (args, cwd, _env, sessionFiles) => {
    const decompress = args.includes('-d') || args.includes('--decompress')
    const target = args.find(a => !a.startsWith('-'))
    if (!target) return { output: ['Usage: gzip [-d] FILE'] }

    if (decompress) {
      const absPath = getAbsolutePath(cwd, target)
      const content = sessionFiles[absPath]

      if (!content) {
        const node = resolvePath(filesystem, cwd, target)
        if (!node) return { output: [`gzip: ${target}: No such file or directory`] }
        return { output: [`gzip: ${target}: not in gzip format`] }
      }

      // Special handling: decompressing the CTF payload
      if (content === '__GZIP_CTF_PAYLOAD__') {
        const outName = target.replace(/\.gz(ip)?$/, '') || target + '.out'
        const absOutPath = getAbsolutePath(cwd, outName)
        return {
          output: [],
          newSessionFiles: {
            [absPath]: '', // "delete" the .gz
            [absOutPath]: `Oops you found me! You should join our ranks, go to /join-cyber-ranger in the url to join us!\n`,
          },
        }
      }

      return { output: [`gzip: ${target}: not in gzip format`] }
    }

    return { output: [`${c.red}gzip: read-only file system (compression disabled)${c.reset}`] }
  },

  xxd: (args, cwd) => {
    const target = args.find(a => !a.startsWith('-'))
    if (!target) return { output: ['Usage: xxd FILE'] }
    const node = resolvePath(filesystem, cwd, target)
    if (!node) return { output: [`xxd: ${target}: No such file or directory`] }
    if (node.name === 'suspicious_image.jpg') {
      return { output: [
        '00000000: ffd8 ffe0 0010 4a46 4946 0001 0100 0001  ......JFIF......',
        '00000010: 0001 0000 ffe1 0022 4578 6966 0000 4949  ......."Exif..II',
        '00000020: 2a00 0800 0000 0100 0e01 0200 0b00 0000  *...............',
        `${c.gray}... (truncated, ${node.size} bytes total)${c.reset}`,
        `0000b000: 1f8b 0800 0000 0000 0003 ${c.green}<-- gzip magic bytes${c.reset}`,
      ] }
    }
    return { output: [`${c.gray}(hex dump not available for this file)${c.reset}`] }
  },

  strings: (args, cwd, env) => {
    const home = env.HOME || '/home/guest'
    const target = args.find(a => !a.startsWith('-'))
    if (!target) return { output: ['Usage: strings FILE'] }
    const absPath = getAbsolutePath(cwd, target, home)
    if (!checkPerm(absPath, env)) return permDenied('strings', target)
    const node = resolvePath(filesystem, cwd, target, home)
    if (!node) return { output: [`strings: ${target}: No such file or directory`] }
    if (node.name === 'suspicious_image.jpg') {
      return { output: [
        'JFIF',
        'Exif',
        'CoreIT Forensics Lab',
        'Adobe Photoshop',
        `${c.gray}... (some strings hidden in binary data)${c.reset}`,
        'nothing to see here',
        `${c.gray}... (try binwalk for deeper analysis)${c.reset}`,
      ] }
    }
    if (node.type === 'file' && node.content) {
      return { output: node.content.split('\n').filter(l => l.length > 3) }
    }
    return { output: [] }
  },

  // ── Blocked write operations ──────────────────────────────────

  rm: () => readOnly('rm'),
  mkdir: () => readOnly('mkdir'),
  touch: () => readOnly('touch'),
  mv: () => readOnly('mv'),
  cp: () => readOnly('cp'),
  chmod: () => readOnly('chmod'),
  chown: () => readOnly('chown'),
  ln: () => readOnly('ln'),
  rmdir: () => readOnly('rmdir'),

  // ── Privilege escalation ──────────────────────────────────────

  sudo: (args, _cwd, env) => {
    if (env.USER === 'root') {
      return { output: [`${c.yellow}sudo: already running as root${c.reset}`] }
    }

    if (args[0] === '-l' || args[0] === '--list') {
      return { output: [
        `Matching Defaults entries for guest on coreit-workstation:`,
        `    env_reset, mail_badpass,`,
        `    secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
        ``,
        `User guest may run the following commands on coreit-workstation:`,
        `    (ALL) NOPASSWD: /usr/bin/cat /var/log/*`,
        `    (ALL) NOPASSWD: /usr/bin/ls /var/log/*`,
        `    (ALL) NOPASSWD: /opt/coreit/bin/health-check`,
      ] }
    }

    // sudo su / sudo su root / sudo -i / sudo bash -> trigger su auth flow
    if (args[0] === 'su' || args[0] === '-i' || args[0] === 'bash') {
      const targetUser = (args[0] === 'su' && args[1]) ? args[1] : 'root'
      return {
        output: [],
        pendingAuth: { type: 'su', targetUser },
      }
    }

    return { output: [
      `${c.red}[sudo] password for guest: `,
      `Sorry, user guest is not allowed to execute '${args.join(' ')}' as root on coreit-workstation.${c.reset}`,
    ] }
  },

  su: (args, _cwd, env) => {
    if (env.USER === 'root') {
      return { output: [`${c.yellow}Already root.${c.reset}`] }
    }
    const targetUser = args.filter(a => a !== '-').find(a => !a.startsWith('-')) || 'root'
    if (targetUser !== 'root') {
      return { output: [`su: user ${targetUser} does not exist or cannot su to that user`] }
    }
    return {
      output: [],
      pendingAuth: { type: 'su', targetUser: 'root' },
    }
  },

  // ── Directory tree ────────────────────────────────────────────

  tree: (args, cwd, env) => {
    const home = env.HOME || '/home/guest'
    let maxDepth = Infinity
    const target = args.find(a => !a.startsWith('-')) || '.'
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-L' && args[i + 1]) maxDepth = parseInt(args[++i]) || Infinity
    }

    const absPath = getAbsolutePath(cwd, target, home)
    if (!checkPerm(absPath, env)) return permDenied('tree', target)

    const node = resolvePath(filesystem, cwd, target, home)
    if (!node) return { output: [`${target} [error opening dir]`] }
    if (node.type === 'file') return { output: [node.name] }

    const lines: string[] = [node.name === '/' ? '.' : node.name]
    let dirs = 0, files = 0

    function walk(n: FSNode, prefix: string, depth: number, parentPath: string) {
      if (depth >= maxDepth) return
      const children = (n.children || []).filter(c => !c.name.startsWith('.'))
      for (let i = 0; i < children.length; i++) {
        const isLast = i === children.length - 1
        const child = children[i]
        const childPath = parentPath === '/' ? `/${child.name}` : `${parentPath}/${child.name}`

        if (!checkPerm(childPath, env)) {
          const connector = isLast ? '└── ' : '├── '
          lines.push(`${prefix}${connector}${c.red}[Permission denied]${c.reset}`)
          continue
        }

        const connector = isLast ? '└── ' : '├── '
        const name = child.type === 'directory'
          ? `${c.blue}${child.name}${c.reset}`
          : child.name
        lines.push(`${prefix}${connector}${name}`)
        if (child.type === 'directory') {
          dirs++
          walk(child, prefix + (isLast ? '    ' : '│   '), depth + 1, childPath)
        } else {
          files++
        }
      }
    }
    walk(node, '', 0, absPath)
    lines.push('', `${dirs} directories, ${files} files`)
    return { output: lines }
  },

  // ── History & misc ────────────────────────────────────────────

  history: () => ({
    output: [
      '    1  ls -la',
      '    2  cd Documents',
      '    3  cat notes.txt',
      '    4  cd ~/scripts',
      '    5  cat health-check.sh',
      '    6  cd /var/log',
      '    7  cat syslog',
      '    8  grep firewall syslog',
      '    9  cd /opt/coreit/config',
      '   10  cat firewall.yml',
    ]
  }),

  man: (args) => {
    const cmd = args[0]
    if (!cmd) return { output: ['What manual page do you want?'] }
    const pages: Record<string, string[]> = {
      ls: [`${c.bold}LS(1)${c.reset}`, '', 'NAME', '       ls - list directory contents', '', 'SYNOPSIS', '       ls [OPTION]... [FILE]...', '', 'OPTIONS', '       -a     do not ignore entries starting with .', '       -l     use a long listing format', '       -la    combination of -l and -a'],
      cd: [`${c.bold}CD(1)${c.reset}`, '', 'NAME', '       cd - change directory', '', 'SYNOPSIS', '       cd [DIR]', '', 'DESCRIPTION', '       Change the working directory to DIR. With no DIR, go to home.'],
      grep: [`${c.bold}GREP(1)${c.reset}`, '', 'NAME', '       grep - print lines matching a pattern', '', 'SYNOPSIS', '       grep [OPTIONS] PATTERN FILE', '', 'OPTIONS', '       -i     case-insensitive', '       -n     show line numbers', '       -c     count matching lines'],
      cat: [`${c.bold}CAT(1)${c.reset}`, '', 'NAME', '       cat - concatenate and print files', '', 'SYNOPSIS', '       cat [FILE]...'],
    }
    return { output: pages[cmd] || [`No manual entry for ${cmd}`] }
  },

  neofetch: (_a, _c, env) => ({
    output: [
      `${c.cyan}       .--.         ${c.reset}${c.bold}${env.USER || 'guest'}${c.reset}@${c.bold}coreit-workstation${c.reset}`,
      `${c.cyan}      |o_o |        ${c.reset}${c.cyan}OS:${c.reset} CoreIT Linux 2026.03`,
      `${c.cyan}      |:_/ |        ${c.reset}${c.cyan}Host:${c.reset} CoreIT Workstation`,
      `${c.cyan}     //   \\ \\       ${c.reset}${c.cyan}Kernel:${c.reset} 6.8.0-coreit`,
      `${c.cyan}    (|     | )      ${c.reset}${c.cyan}Uptime:${c.reset} 47 days, 3 hours`,
      `${c.cyan}   /'\\_   _/\`\\     ${c.reset}${c.cyan}Shell:${c.reset} bash 5.2.21`,
      `${c.cyan}   \\___)=(___/      ${c.reset}${c.cyan}Terminal:${c.reset} CoreIT WebTerm`,
      `                    ${c.cyan}CPU:${c.reset} Intel i7-13700K @ 5.40GHz`,
      `                    ${c.cyan}Memory:${c.reset} 2151MiB / 7952MiB`,
      '',
      `   ${c.red}███${c.green}███${c.yellow}███${c.blue}███${c.magenta}███${c.cyan}███${c.reset}`,
    ]
  }),

  clear: () => ({ output: [] }),

  help: () => ({
    output: [
      `${c.bold}${c.cyan}CoreIT Terminal v2.0${c.reset} — Sandboxed Linux Environment`,
      '',
      `${c.bold}Navigation${c.reset}`,
      `  ${c.green}ls${c.reset} [-la] [path]     List directory contents`,
      `  ${c.green}cd${c.reset} [path]           Change directory (~ = home)`,
      `  ${c.green}pwd${c.reset}                 Print working directory`,
      `  ${c.green}tree${c.reset} [-L n] [path]  Show directory tree`,
      '',
      `${c.bold}File Operations${c.reset}`,
      `  ${c.green}cat${c.reset} <file>          Display file contents`,
      `  ${c.green}head${c.reset} [-n N] <file>  Show first N lines`,
      `  ${c.green}tail${c.reset} [-n N] <file>  Show last N lines`,
      `  ${c.green}wc${c.reset} <file>           Word/line/char count`,
      `  ${c.green}file${c.reset} <file>         Determine file type`,
      '',
      `${c.bold}Search${c.reset}`,
      `  ${c.green}grep${c.reset} [-in] PAT FILE Search pattern in file`,
      `  ${c.green}find${c.reset} [path] -name P Find files by name`,
      '',
      `${c.bold}System Info${c.reset}`,
      `  ${c.green}whoami${c.reset}  ${c.green}id${c.reset}  ${c.green}hostname${c.reset}  ${c.green}uname${c.reset} [-a]  ${c.green}date${c.reset}  ${c.green}uptime${c.reset}`,
      `  ${c.green}ps${c.reset} [aux]  ${c.green}top${c.reset}  ${c.green}df${c.reset} [-h]  ${c.green}free${c.reset} [-h]  ${c.green}du${c.reset} [-h]`,
      '',
      `${c.bold}Network (read-only)${c.reset}`,
      `  ${c.green}ifconfig${c.reset}  ${c.green}ip${c.reset} [addr|route]  ${c.green}ping${c.reset} <host>`,
      '',
      `${c.bold}Environment${c.reset}`,
      `  ${c.green}echo${c.reset} [text]  ${c.green}env${c.reset}  ${c.green}export${c.reset} KEY=VAL  ${c.green}which${c.reset} <cmd>`,
      '',
      `${c.bold}Other${c.reset}`,
      `  ${c.green}neofetch${c.reset}  ${c.green}history${c.reset}  ${c.green}man${c.reset} <cmd>  ${c.green}clear${c.reset}  ${c.green}help${c.reset}`,
      '',
      `${c.gray}Note: This is a sandboxed environment. Write operations and`,
      `network access are restricted for security.${c.reset}`,
    ]
  }),
}

// Aliases
cmds.ll = (args, cwd, env, sf) => cmds.ls(['-la', ...args], cwd, env, sf)
cmds.la = (args, cwd, env, sf) => cmds.ls(['-a', ...args], cwd, env, sf)
cmds['..'] = (_a, cwd, env, sf) => cmds.cd(['..'], cwd, env, sf)

// ── Main processor ──────────────────────────────────────────────

export function processCommand(
  input: string,
  cwd: string,
  env: Env,
  sessionFiles: SessionFiles = {}
): CommandResult & { clear?: boolean } {
  const trimmed = input.trim()
  if (!trimmed) return { output: [] }

  // Handle semicolons (sequential commands)
  if (trimmed.includes(';')) {
    const parts = trimmed.split(';').map(s => s.trim()).filter(Boolean)
    const allOutput: string[] = []
    let currentCwd = cwd
    let currentEnv = env
    let currentSF = sessionFiles
    let lastPendingAuth: CommandResult['pendingAuth'] = undefined
    for (const part of parts) {
      const result = processCommand(part, currentCwd, currentEnv, currentSF)
      if (result.clear) return { output: [], clear: true }
      allOutput.push(...result.output)
      if (result.newCwd) currentCwd = result.newCwd
      if (result.newEnv) currentEnv = result.newEnv
      if (result.newSessionFiles) currentSF = { ...currentSF, ...result.newSessionFiles }
      if (result.pendingAuth) lastPendingAuth = result.pendingAuth
    }
    return { output: allOutput, newCwd: currentCwd !== cwd ? currentCwd : undefined, newEnv: currentEnv, newSessionFiles: currentSF !== sessionFiles ? currentSF : undefined, pendingAuth: lastPendingAuth }
  }

  // Handle && (run next only if previous succeeds)
  if (trimmed.includes('&&')) {
    const parts = trimmed.split('&&').map(s => s.trim()).filter(Boolean)
    const allOutput: string[] = []
    let currentCwd = cwd
    let currentEnv = env
    let currentSF = sessionFiles
    let lastPendingAuth: CommandResult['pendingAuth'] = undefined
    for (const part of parts) {
      const result = processCommand(part, currentCwd, currentEnv, currentSF)
      if (result.clear) return { output: [], clear: true }
      allOutput.push(...result.output)
      if (result.newCwd) currentCwd = result.newCwd
      if (result.newEnv) currentEnv = result.newEnv
      if (result.newSessionFiles) currentSF = { ...currentSF, ...result.newSessionFiles }
      if (result.pendingAuth) lastPendingAuth = result.pendingAuth
    }
    return { output: allOutput, newCwd: currentCwd !== cwd ? currentCwd : undefined, newEnv: currentEnv, newSessionFiles: currentSF !== sessionFiles ? currentSF : undefined, pendingAuth: lastPendingAuth }
  }

  // Handle pipes (simplified: pass output as "file" to next command)
  if (trimmed.includes(' | ')) {
    const parts = trimmed.split(' | ').map(s => s.trim())
    let prevOutput: string[] = []
    let currentCwd = cwd
    let currentEnv = env

    for (let i = 0; i < parts.length; i++) {
      if (i === 0) {
        const result = processCommand(parts[i], currentCwd, currentEnv, sessionFiles)
        prevOutput = result.output
        if (result.newCwd) currentCwd = result.newCwd
        if (result.newEnv) currentEnv = result.newEnv
      } else {
        const [cmd, ...args] = parts[i].split(/\s+/)
        if (cmd === 'grep') {
          const pattern = args.find(a => !a.startsWith('-')) || ''
          const ignoreCase = args.includes('-i')
          const regex = new RegExp(pattern, ignoreCase ? 'i' : '')
          prevOutput = prevOutput.filter(line => regex.test(line))
        } else if (cmd === 'head') {
          const n = parseInt(args[0]?.replace('-', '') || '10')
          prevOutput = prevOutput.slice(0, n)
        } else if (cmd === 'tail') {
          const n = parseInt(args[0]?.replace('-', '') || '10')
          prevOutput = prevOutput.slice(-n)
        } else if (cmd === 'wc') {
          if (args.includes('-l')) {
            prevOutput = [String(prevOutput.length)]
          } else {
            const text = prevOutput.join('\n')
            prevOutput = [`  ${prevOutput.length}  ${text.split(/\s+/).filter(Boolean).length} ${text.length}`]
          }
        } else if (cmd === 'sort') {
          prevOutput = [...prevOutput].sort()
        } else if (cmd === 'uniq') {
          prevOutput = prevOutput.filter((line, i, arr) => i === 0 || line !== arr[i - 1])
        } else {
          prevOutput = [`${c.yellow}pipe: '${cmd}' not supported in pipe${c.reset}`]
        }
      }
    }
    return { output: prevOutput, newCwd: currentCwd !== cwd ? currentCwd : undefined }
  }

  // Parse single command
  const [cmd, ...args] = trimmed.split(/\s+/)

  if (cmd === 'clear') {
    return { output: [], clear: true }
  }

  const handler = cmds[cmd]
  if (!handler) {
    return { output: [`${c.red}command not found: ${cmd}${c.reset}`, `Type ${c.green}'help'${c.reset} for available commands.`] }
  }

  return handler(args, cwd, env, sessionFiles)
}
