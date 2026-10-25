import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="site" style={{ '--p-bg': '#001219', '--p-ink': '#f5ebe0', '--p-acc': '#ee9b00', '--p-soft': '#f5ebe026' } as React.CSSProperties}>
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
