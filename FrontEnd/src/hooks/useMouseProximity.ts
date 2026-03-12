import { useRef, useState, useCallback } from 'react'

export function useMouseProximity(threshold: number = 60) {
  const ref = useRef<HTMLDivElement>(null)
  const [isNear, setIsNear] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const distanceFromBottom = rect.bottom - e.clientY
      setIsNear(distanceFromBottom >= 0 && distanceFromBottom <= threshold)
    },
    [threshold]
  )

  const handleMouseLeave = useCallback(() => {
    setIsNear(false)
  }, [])

  return { ref, isNear, handleMouseMove, handleMouseLeave }
}
