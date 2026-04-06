import { useEffect, useRef } from 'react'

/**
 * Custom hook for scroll-based reveal animations using IntersectionObserver.
 * Elements with [data-scroll-reveal] attribute will animate into view when visible.
 */
export default function useScrollReveal(options = {}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const {
      threshold = 0.1,
      rootMargin = '0px 0px -60px 0px',
      staggerDelay = 80,
    } = options

    const elements = container.querySelectorAll('[data-scroll-reveal]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add stagger delay for sibling elements
            const el = entry.target
            const siblings = el.parentElement?.querySelectorAll('[data-scroll-reveal]')
            if (siblings) {
              const index = Array.from(siblings).indexOf(el)
              el.style.transitionDelay = `${index * staggerDelay}ms`
            }
            el.classList.add('scroll-revealed')
            observer.unobserve(el) // Only animate once
          }
        })
      },
      { threshold, rootMargin }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin, options.staggerDelay])

  return containerRef
}
