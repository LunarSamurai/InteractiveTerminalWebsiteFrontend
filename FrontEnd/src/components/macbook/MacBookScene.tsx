import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import MacBookLid from './MacBookLid'
import MacBookHinge from './MacBookHinge'
import MacBookKeyboard from './MacBookKeyboard'

gsap.registerPlugin(ScrollTrigger)

export default function MacBookScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const lidRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useGSAP(
    () => {
      if (!sceneRef.current || !lidRef.current || !screenRef.current) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
          onUpdate: (self) => {
            setProgress(self.progress)
          },
        },
      })

      // Lid opens from -95deg (closed) to 0deg (open)
      tl.fromTo(
        lidRef.current,
        { rotateX: -95 },
        { rotateX: 0, ease: 'power2.out' },
        0
      )

      // Scene scales up and rises
      tl.fromTo(
        sceneRef.current,
        { scale: 0.85, y: 40 },
        { scale: 1, y: 0 },
        0
      )

      // Screen content fades in during second half
      tl.fromTo(
        screenRef.current,
        { opacity: 0 },
        { opacity: 1, ease: 'power1.in' },
        0.4
      )
    },
    { scope: sceneRef }
  )

  // Disable pointer events on screen until lid is mostly open
  const [interactive, setInteractive] = useState(false)
  useEffect(() => {
    setInteractive(progress > 0.85)
  }, [progress])

  return (
    <div
      ref={sceneRef}
      className="h-screen flex items-center justify-center"
      style={{ perspective: '1500px', perspectiveOrigin: '50% 60%', zIndex: 1 }}
    >
      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        <MacBookLid ref={lidRef} screenRef={screenRef} interactive={interactive} />
        <MacBookHinge />
        <MacBookKeyboard />
      </div>
    </div>
  )
}
