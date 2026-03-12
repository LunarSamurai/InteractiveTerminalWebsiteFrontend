export default function MacBookBase() {
  return (
    <div className="relative w-[1000px] h-[20px] mx-auto">
      {/* Main base body */}
      <div className="w-full h-full bg-gradient-to-b from-[#2a2a2e] to-[#1f1f23] rounded-b-lg shadow-xl">
        {/* Front lip notch */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-[3px] bg-[#333] rounded-b-sm" />
      </div>
      {/* Shadow underneath */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-black/30 blur-md rounded-full" />
    </div>
  )
}
