import { onUnmounted } from 'vue'
import { gsap } from 'gsap'

export function useGsapContext() {
  let ctx = null

  function create(scope, callback) {
    if (!scope) return null
    ctx?.revert()
    ctx = gsap.context(callback, scope)
    return ctx
  }

  function revert() {
    ctx?.revert()
    ctx = null
  }

  onUnmounted(revert)

  return { create, revert }
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
