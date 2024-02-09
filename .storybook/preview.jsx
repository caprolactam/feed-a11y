import './style.css'
// for e2e
if (import.meta.env.STORYBOOK_E2E) {
  const style = document.createElement('style')
  // elements with `pointer-events: none` can't be found by document.elementFromPoint()
  style.appendChild(
    document.createTextNode(
      `* { 
        pointer-events: auto !important;
      }`,
    ),
  )
  document.head.appendChild(style)
}

/** @type { import('@storybook/react').Preview } */
export default {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
}
