type Key = string | { label: string; flex?: number; split?: boolean }

const fnRow: Key[] = ['esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', '⏏']
const numRow: Key[] = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', { label: '⌫', flex: 1.6 }]
const qwertyRow: Key[] = [{ label: '⇥', flex: 1.6 }, 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', { label: '\\', flex: 1.6 }]
const homeRow: Key[] = [{ label: '⇪', flex: 1.9 }, 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", { label: '↵', flex: 1.9 }]
const shiftRow: Key[] = [{ label: '⇧', flex: 2.5 }, 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', { label: '⇧', flex: 2.5 }]
const bottomRow: Key[] = [
  { label: 'fn', flex: 1 }, { label: '⌃', flex: 1 }, { label: '⌥', flex: 1 }, { label: '⌘', flex: 1.3 },
  { label: '', flex: 6 },
  { label: '⌘', flex: 1.3 }, { label: '⌥', flex: 1 },
  { label: '◀', flex: 1 }, { label: '▲▼', flex: 1, split: true }, { label: '▶', flex: 1 },
]

const rows: { keys: Key[]; h: number; isFn?: boolean }[] = [
  { keys: fnRow, h: 14, isFn: true },
  { keys: numRow, h: 26 },
  { keys: qwertyRow, h: 26 },
  { keys: homeRow, h: 26 },
  { keys: shiftRow, h: 26 },
  { keys: bottomRow, h: 26 },
]

const nonTypingKeys = new Set([
  'esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  '⏏', 'fn', '⌃', '⌥', '⌘', '⇧', '⇪', '⇥',
])

function getKeyValue(label: string): string | null {
  if (label === '') return ' '
  if (label === '⌫') return 'Backspace'
  if (label === '↵') return 'Enter'
  if (label === '◀') return 'ArrowLeft'
  if (label === '▶') return 'ArrowRight'
  if (nonTypingKeys.has(label)) return null
  if (label.length === 1) return label.toLowerCase()
  return null
}

function dispatchKey(key: string) {
  document.dispatchEvent(new CustomEvent('macbook-key', { detail: { key } }))
}

function KeyCap({ label, height, flex, isFn, isSplit }: {
  label: string; height: number; flex: number; isFn?: boolean; isSplit?: boolean
}) {
  if (isSplit) {
    return (
      <div className="flex flex-col gap-[1px]" style={{ flex, height }}>
        <div
          className="flex-1 rounded-[3px] bg-[#232328] flex items-center justify-center border border-white/[0.04] shadow-[0_1px_0_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] hover:bg-[#2e2e34] hover:border-white/[0.08] active:bg-[#1a1a1e] transition-all duration-100 cursor-pointer select-none"
          onClick={() => dispatchKey('ArrowUp')}
        >
          <span className="text-[6px] text-white/25 pointer-events-none">▲</span>
        </div>
        <div
          className="flex-1 rounded-[3px] bg-[#232328] flex items-center justify-center border border-white/[0.04] shadow-[0_1px_0_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] hover:bg-[#2e2e34] hover:border-white/[0.08] active:bg-[#1a1a1e] transition-all duration-100 cursor-pointer select-none"
          onClick={() => dispatchKey('ArrowDown')}
        >
          <span className="text-[6px] text-white/25 pointer-events-none">▼</span>
        </div>
      </div>
    )
  }

  const keyValue = getKeyValue(label)
  const isInteractive = keyValue !== null

  return (
    <div
      className={`rounded-[4px] flex items-center justify-center bg-[#232328] border border-white/[0.04] shadow-[0_1px_0_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] ${
        isInteractive
          ? 'hover:bg-[#2e2e34] hover:border-white/[0.08] active:bg-[#1a1a1e] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] cursor-pointer'
          : 'hover:bg-[#282830] cursor-default'
      } transition-all duration-100 select-none`}
      style={{ flex, height }}
      onClick={keyValue ? () => dispatchKey(keyValue) : undefined}
    >
      {label && (
        <span className={`${isFn ? 'text-[6px]' : 'text-[8px]'} text-white/25 select-none leading-none pointer-events-none`}>
          {label}
        </span>
      )}
    </div>
  )
}

export default function MacBookKeyboard() {
  return (
    <div className="relative w-[960px] mx-auto">
      <div className="w-full bg-gradient-to-b from-[#2a2a2e] to-[#232327] rounded-b-2xl pt-1.5 pb-3 px-5 shadow-2xl">
        {/* Speaker grilles */}
        <div className="flex justify-between px-8 mb-1.5">
          <div className="flex gap-[2px]">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={`sl${i}`} className="w-[1.5px] h-[2px] rounded-full bg-black/40" />
            ))}
          </div>
          <div className="flex gap-[2px]">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={`sr${i}`} className="w-[1.5px] h-[2px] rounded-full bg-black/40" />
            ))}
          </div>
        </div>

        {/* Key rows */}
        <div className="flex flex-col gap-[2px] px-3">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-[2px]">
              {row.keys.map((key, ki) => {
                const isObj = typeof key === 'object'
                const label = isObj ? key.label : key
                const flex = isObj && key.flex ? key.flex : 1
                const isSplit = isObj && 'split' in key && key.split
                return (
                  <KeyCap
                    key={ki}
                    label={label}
                    height={row.h}
                    flex={flex}
                    isFn={row.isFn}
                    isSplit={!!isSplit}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Trackpad */}
        <div className="mt-2 flex justify-center">
          <div className="w-[340px] h-[220px] rounded-xl bg-[#1f1f23] border border-white/[0.05] shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]" />
        </div>

        {/* Front lip notch */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-[#3a3a3e] rounded-b-sm" />
      </div>

      {/* Shadow */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-black/30 blur-xl rounded-full" />
    </div>
  )
}
