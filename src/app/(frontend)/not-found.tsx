import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="site" style={{ '--p-bg': '#1b1030', '--p-ink': '#ffe8c2', '--p-acc': '#ff3d7f', '--p-soft': '#ffe8c226' } as React.CSSProperties}>
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
