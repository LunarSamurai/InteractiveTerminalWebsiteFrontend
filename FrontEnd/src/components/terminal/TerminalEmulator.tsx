import { useRef, useEffect } from 'react'
import { useTerminal } from './useTerminal'

export default function TerminalEmulator() {
  const { lines, prompt, currentInput, setCurrentInput, execute, navigateHistory, tabComplete, setLines, pendingAuth } = useTerminal()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Ref to currentInput for MacBook keyboard event handler
  const currentInputRef = useRef(currentInput)
  currentInputRef.current = currentInput

  // Listen for key presses from the MacBook keyboard component
  useEffect(() => {
    const handler = (e: Event) => {
      const key = (e as CustomEvent).detail?.key as string
      if (!key) return

      if (key === 'Backspace') {
        setCurrentInput(prev => prev.slice(0, -1))
      } else if (key === 'Enter') {
        execute(currentInputRef.current)
      } else if (key === 'ArrowUp') {
        if (!pendingAuth) navigateHistory('up')
      } else if (key === 'ArrowDown') {
        if (!pendingAuth) navigateHistory('down')
      } else if (key.length === 1) {
        setCurrentInput(prev => prev + key)
      }

      inputRef.current?.focus({ preventScroll: true })
    }

    document.addEventListener('macbook-key', handler)
    return () => document.removeEventListener('macbook-key', handler)
  }, [execute, setCurrentInput, navigateHistory, pendingAuth])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      execute(currentInput)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!pendingAuth) navigateHistory('up')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!pendingAuth) navigateHistory('down')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (!pendingAuth) {
        const result = tabComplete()
        if (result) {
          setCurrentInput(result.completed)
          if (result.options.length > 1) {
            // Show available options like a real terminal
            setLines(prev => [
              ...prev,
              { type: 'input' as const, text: `${prompt}${currentInput}` },
              { type: 'output' as const, text: result.options.join('  ') },
            ])
          }
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      execute('clear')
    }
  }

  const renderLine = (text: string) => {
    // Handle ANSI color codes
    const parts = text.split(/\x1b\[(\d+)m/)
    if (parts.length === 1) return <span>{text}</span>

    const ansiMap: Record<string, string> = {
      '0': '', // reset
      '1': 'font-bold',
      '2': 'opacity-60',
      '31': 'text-red-400',
      '32': 'text-green-400',
      '33': 'text-yellow-400',
      '34': 'text-blue-400',
      '35': 'text-purple-400',
      '36': 'text-cyan-400',
      '37': 'text-white',
      '90': 'text-white/40',
    }

    const elements: React.ReactNode[] = []
    let classes = ''
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        classes = ansiMap[parts[i]] || ''
        continue
      }
      if (parts[i]) {
        elements.push(
          <span key={i} className={classes}>
            {parts[i]}
          </span>
        )
        classes = ''
      }
    }
    return <>{elements}</>
  }

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-auto p-4 font-mono text-sm leading-6 text-green-400 cursor-text"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      {lines.map((line, i) => (
        <div key={i} className={line.type === 'system' ? 'text-white/40' : ''}>
          {renderLine(line.text)}
        </div>
      ))}

      {/* Current input line */}
      <div className="flex">
        {pendingAuth ? (
          <span className="text-yellow-400 whitespace-pre">Password: </span>
        ) : (
          <span className="text-green-400 whitespace-pre">{prompt}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`flex-1 bg-transparent outline-none ${pendingAuth ? 'text-transparent caret-transparent' : 'text-green-400 caret-green-400'}`}
          spellCheck={false}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
        />
      </div>
    </div>
  )
}
