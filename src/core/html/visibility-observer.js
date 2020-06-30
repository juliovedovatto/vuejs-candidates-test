import 'intersection-observer'

export function visibilityObserver(target, callback, options = null) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback.call(null, entry)
      }
    })
  }, options || {})

  observer.observe(target)

  return observer
}
