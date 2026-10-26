'use client'

import { useEffect, useState } from 'react'

/**
 * Filter buttons for the home page index. The list is complete in the HTML; this only hides the rows of other
 * categories (rows carry data-cat). Rendered after mount, so without JS there are no dead buttons — just every project.
 */
export function CategoryFilter({ categories }: { categories: { id: number | string; title: string }[] }) {
  const [on, setOn] = useState<string>('all')
  const [ready, setReady] = useState(false)
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => setReady(true), [])

  const pick = (id: string) => {
    setOn(id)
    const rows = [...document.querySelectorAll<HTMLLIElement>('[data-rows] > li')]
    let n = 0
    rows.forEach((li) => {
      const show = id === 'all' || li.dataset.cat === id
      li.hidden = !show
      if (show) n++
    })
    setCount(n)
    // Motion repaints the index in the colours of the first project shown
    dispatchEvent(new CustomEvent('mm:filter', { detail: id }))
  }

  if (!ready) return null
  return (
    <>
      <div className="ix-filter" role="group" aria-label="סינון עבודות לפי קטגוריה">
        {[{ id: 'all', title: 'הכל' }, ...categories.map((c) => ({ id: String(c.id), title: c.title }))].map((c) => (
          <button key={c.id} type="button" aria-pressed={on === c.id} onClick={() => pick(c.id)}>
            {c.title}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {count === null ? '' : `מוצגים ${count} פרויקטים`}
      </p>
    </>
  )
}
