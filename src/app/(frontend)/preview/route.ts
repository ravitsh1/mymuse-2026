import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

/** Admin "preview" button: logged-in editors see drafts. /preview?path=/portfolio/jullius  (/preview?off=1 to exit) */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const path = url.searchParams.get('path') || '/'
  const safePath = path.startsWith('/') && !path.startsWith('//') ? path : '/'
  const dm = await draftMode()

  if (url.searchParams.get('off')) {
    dm.disable()
    redirect(safePath)
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return new Response('צריך להתחבר לממשק הניהול כדי לראות טיוטות.', { status: 403 })

  dm.enable()
  redirect(safePath)
}
