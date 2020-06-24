export function getScrollableParent(element, includeHidden = false, includeSelf = false) {
  let style = getComputedStyle(element)
  const excludeStaticParent = style.position === 'absolute'
  const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/

  if (style.position === 'fixed') {
    return document.scrollingElement || document.documentElement
  }

  let parent = includeSelf ? element : element.parentElement

  do {
    if (!parent) {
      break
    }

    style = getComputedStyle(parent)

    if (excludeStaticParent && style.position === 'static') {
      continue
    }

    if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent
    }
  } while (parent && (parent = parent.parentElement))

  return document.scrollingElement || document.documentElement
}
