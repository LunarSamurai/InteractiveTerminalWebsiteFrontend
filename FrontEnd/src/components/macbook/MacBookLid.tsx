import { forwardRef, type RefObject } from 'react'
import MacBookScreen from './MacBookScreen'

interface MacBookLidProps {
  screenRef: RefObject<HTMLDivElement | null>
  interactive: boolean
}

const MacBookLid = forwardRef<HTMLDivElement, MacBookLidProps>(
  ({ screenRef, interactive }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-[960px] h-[600px] origin-bottom"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'bottom center',
        }}
      >
        {/* Lid outer shell */}
        <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1e] shadow-2xl">
          {/* Bezel frame */}
          <div className="absolute inset-3 rounded-xl bg-black overflow-hidden">
            {/* Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 z-10">
              <div className="w-2 h-2 rounded-full bg-[#2a2a2e] mx-auto mt-1" />
            </div>
            {/* Screen content */}
            <MacBookScreen ref={screenRef} interactive={interactive} />
          </div>
        </div>
      </div>
    )
  }
)

MacBookLid.displayName = 'MacBookLid'
export default MacBookLid
