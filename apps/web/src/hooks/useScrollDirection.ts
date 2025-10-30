import { useEffect, useRef, useState } from 'react'

export function useScrollDirection(threshold: number = 10) {
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current
      if (Math.abs(delta) > threshold) {
        setDirection(delta > 0 ? 'down' : 'up')
        lastScrollY.current = currentY
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return direction
}


