import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="site" style={{ '--p-bg': '#16141a', '--p-ink': '#efe8de', '--p-acc': '#d6a05b', '--p-soft': '#efe8de26' } as React.CSSProperties}>
      <main id="content" className="prose wrap">
        <h1>העמוד לא נמצא</h1>
        <p>ייתכן שהכתובת השתנתה. אפשר לחזור לעמוד הבית ולמצוא את הפרויקט משם.</p>
        <p>
          <Link href="/">לעמוד הבית</Link>
        </p>
      </main>
    </div>
  )
}
