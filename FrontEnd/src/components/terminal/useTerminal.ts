import { useState, useCallback } from 'react'
import { processCommand, validateAuth, type SessionFiles } from './commands'
import { filesystem, resolvePath, getAbsolutePath } from './filesystem'

export interface TerminalLine {
  type: 'input' | 'output' | 'system'
  text: string
}

const defaultEnv: Record<string, string> = {
  HOME: '/home/guest',
  USER: 'guest',
  SHELL: '/bin/bash',
  PATH: '/usr/local/bin:/usr/bin:/bin',
  HOSTNAME: 'coreit-workstation',
  TERM: 'xterm-256color',
  LANG: 'en_US.UTF-8',
  PS1: 'guest@coreit:\\w$ ',
  PWD: '/home/guest',
  EDITOR: 'nano',
}

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', text: '' },
    { type: 'system', text: '  ╔══════════════════════════════════════════╗' },
    { type: 'system', text: '  ║   CoreIT Secure Workstation v2026.03     ║' },
    { type: 'system', text: '  ║   All activity is monitored and logged   ║' },
    { type: 'system', text: '  ╚══════════════════════════════════════════╝' },
    { type: 'system', text: '' },
    { type: 'system', text: "Type 'help' for available commands." },
    { type: 'system', text: '' },
  ])
  const [cwd, setCwd] = useState('/home/guest')
  const [env, setEnv] = useState<Record<string, string>>(defaultEnv)
  const [sessionFiles, setSessionFiles] = useState<SessionFiles>({})
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentInput, setCurrentInput] = useState('')
  const [pendingAuth, setPendingAuth] = useState<{ type: 'su'; targetUser: string } | null>(null)

  // Dynamic prompt based on user identity
  const isRoot = env.USER === 'root'
  const homeDir = env.HOME || '/home/guest'
  const displayCwd = cwd === homeDir ? '~' : cwd.startsWith(homeDir + '/') ? '~' + cwd.slice(homeDir.length) : cwd
  const prompt = `${env.USER || 'guest'}@coreit:${displayCwd}${isRoot ? '#' : '$'} `

  const execute = useCallback(
    (input: string) => {
      // Handle pending authentication (su password prompt)
      if (pendingAuth) {
        const maskedInput = '*'.repeat(input.length)
        setLines((prev) => [
          ...prev,
          { type: 'input', text: `Password: ${maskedInput}` },
        ])

        const result = validateAuth(pendingAuth, input, env)
        setPendingAuth(null)

        if (result.success) {
          if (result.newEnv) setEnv(result.newEnv)
          if (result.newCwd) {
            setCwd(result.newCwd)
          }
        }
        if (result.output.length > 0) {
          setLines((prev) => [
            ...prev,
            ...result.output.map((text) => ({ type: 'output' as const, text })),
          ])
        }

        setCurrentInput('')
        return
      }

      // Normal command execution
      const result = processCommand(input, cwd, env, sessionFiles)

      if (result.clear) {
        setLines([])
      } else {
        setLines((prev) => [
          ...prev,
          { type: 'input', text: `${prompt}${input}` },
          ...result.output.map((text) => ({ type: 'output' as const, text })),
        ])
      }

      if (result.newCwd !== undefined) {
        setCwd(result.newCwd)
        setEnv((prev) => ({ ...prev, PWD: result.newCwd! }))
      }

      if (result.newEnv) {
        setEnv(result.newEnv)
      }

      if (result.newSessionFiles) {
        setSessionFiles((prev) => {
          const updated = { ...prev, ...result.newSessionFiles }
          // Remove entries with empty string (deleted files)
          for (const [k, v] of Object.entries(updated)) {
            if (v === '') delete updated[k]
          }
          return updated
        })
      }

      // Handle pending auth from command result
      if (result.pendingAuth) {
        setPendingAuth(result.pendingAuth)
      }

      if (input.trim()) {
        setCommandHistory((prev) => [...prev, input.trim()])
      }
      setHistoryIndex(-1)
      setCurrentInput('')
    },
    [cwd, env, prompt, sessionFiles, pendingAuth]
  )

  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      if (commandHistory.length === 0) return

      let newIndex: number
      if (direction === 'up') {
        newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
      } else {
        newIndex = historyIndex === -1 ? -1 : historyIndex + 1
        if (newIndex >= commandHistory.length) newIndex = -1
      }

      setHistoryIndex(newIndex)
      setCurrentInput(newIndex === -1 ? '' : commandHistory[newIndex])
    },
    [commandHistory, historyIndex]
  )

  const tabComplete = useCallback((): { completed: string; options: string[] } | null => {
    const input = currentInput
    const parts = input.split(/\s+/)
    const isFirstWord = parts.length <= 1

    if (isFirstWord) {
      // Command name completion
      const prefix = parts[0] || ''
      if (!prefix) return null
      const commands = [
        'ls','cd','cat','head','tail','less','more','grep','find','wc','pwd',
        'whoami','id','hostname','uname','date','uptime','echo','env','printenv',
        'export','which','file','du','df','free','ps','top','ifconfig','ip',
        'ping','curl','tree','history','man','neofetch','clear','help',
        'binwalk','dd','gzip','xxd','strings','ll','la','su','sudo',
      ]
      const matches = commands.filter(c => c.startsWith(prefix))
      if (matches.length === 0) return null
      if (matches.length === 1) return { completed: matches[0] + ' ', options: [] }
      // Complete to longest common prefix
      let common = matches[0]
      for (const m of matches) {
        while (!m.startsWith(common)) common = common.slice(0, -1)
      }
      return { completed: common, options: matches }
    }

    // Path completion for arguments
    const home = env.HOME || '/home/guest'
    const lastPart = parts[parts.length - 1] || ''
    const beforeLast = input.slice(0, input.length - lastPart.length)

    // Split last part into directory and prefix
    const lastSlash = lastPart.lastIndexOf('/')
    let dirPart: string
    let namePrefix: string
    if (lastSlash === -1) {
      dirPart = '.'
      namePrefix = lastPart
    } else {
      dirPart = lastPart.slice(0, lastSlash) || '/'
      namePrefix = lastPart.slice(lastSlash + 1)
    }

    const node = resolvePath(filesystem, cwd, dirPart, home)
    if (!node || node.type !== 'directory') return null

    // Gather static children
    const candidates: { name: string; isDir: boolean }[] = (node.children || [])
      .filter(c => c.name.startsWith(namePrefix) && !c.name.startsWith('.'))
      .map(c => ({ name: c.name, isDir: c.type === 'directory' }))

    // Gather session files in this directory
    const absDirPath = getAbsolutePath(cwd, dirPart, home).replace(/\/$/, '')
    const staticNames = new Set(candidates.map(c => c.name))
    for (const sfPath of Object.keys(sessionFiles)) {
      const sfParts = sfPath.split('/')
      const sfName = sfParts.pop() || ''
      const sfDir = sfParts.join('/') || '/'
      if (sfDir === absDirPath && sfName.startsWith(namePrefix) && !staticNames.has(sfName)) {
        candidates.push({ name: sfName, isDir: false })
      }
    }

    if (candidates.length === 0) return null

    const dirPrefix = lastSlash === -1 ? '' : lastPart.slice(0, lastSlash + 1)

    if (candidates.length === 1) {
      const c = candidates[0]
      const suffix = c.isDir ? '/' : ' '
      return { completed: beforeLast + dirPrefix + c.name + suffix, options: [] }
    }

    // Common prefix
    let common = candidates[0].name
    for (const c of candidates) {
      while (!c.name.startsWith(common)) common = common.slice(0, -1)
    }
    return {
      completed: beforeLast + dirPrefix + common,
      options: candidates.map(c => c.name + (c.isDir ? '/' : '')),
    }
  }, [currentInput, cwd, sessionFiles, env.HOME])

  return {
    lines,
    cwd,
    prompt,
    currentInput,
    setCurrentInput,
    execute,
    navigateHistory,
    tabComplete,
    setLines,
    pendingAuth,
  }
}
