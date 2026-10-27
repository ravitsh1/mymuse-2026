'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/** Under "all" the index starts with this many rows; "more" adds the same again. */
const STEP = 10

/**
 * Filter buttons for the home page index, and the "more projects" button under it. The list is complete in the HTML;
 * this only hides rows (rows carry data-cat): other categories, and under "all" the rows past the current limit.
 * Rendered after mount, so without JS there are no dead buttons — just every project.
 */
export function CategoryFilter({ categories }: { categories: { id: number | string; title: string }[] }) {
  const [on, setOn] = useState<string>('all')
  const [limit, setLimit] = useState(STEP)
  const [more, setMore] = useState(0)
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  const [count, setCount] = useState<number | null>(null)

  const rows = () => [...document.querySelectorAll<HTMLLIElement>('[data-rows] > li')]

  // shows the rows for a category (and limit); returns how many are shown
  const apply = (id: string, max: number) => {
    let n = 0
    let left = 0
    rows().forEach((li) => {
      const match = id === 'all' || li.dataset.cat === id
      const show = match && (id !== 'all' || n < max)
      li.hidden = !show
      if (show) n++
      else if (match) left++
    })
    setMore(left)
    return n
  }

  useEffect(() => {
    setSlot(document.querySelector<HTMLElement>('[data-more]'))
    apply('all', STEP)
  }, [])

  const pick = (id: string) => {
    setOn(id)
    setCount(apply(id, limit))
    // Motion repaints the index in the colours of the first project shown
    dispatchEvent(new CustomEvent('mm:filter', { detail: id }))
  }

  const showMore = () => {
    const first = rows().filter((li) => !li.hidden).length
    const next = limit + STEP
    setLimit(next)
    setCount(apply('all', next))
    // keyboard and screen-reader users continue from the first project just added
    rows()[first]?.querySelector<HTMLAnchorElement>('a.row')?.focus()
  }

  if (!slot) return null
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
      {on === 'all' &&
        more > 0 &&
        createPortal(
          <button type="button" className="go" onClick={showMore}>
            עוד פרויקטים <span aria-hidden="true">({more})</span>
            <span className="sr-only">, נותרו {more}</span>
          </button>,
          slot,
        )}
    </>
  )
}
