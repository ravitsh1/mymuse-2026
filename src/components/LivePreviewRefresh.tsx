'use client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// The live-preview library is only needed inside the admin's preview pane (an iframe): visitors never download it.
const RefreshRouteOnSave = dynamic(() => import('@payloadcms/live-preview-react').then((m) => m.RefreshRouteOnSave), { ssr: false })

/** Inside the admin's live-preview pane: re-render the page whenever the editor saves. */
export function LivePreviewRefresh() {
  const router = useRouter()
  const [inFrame, setInFrame] = useState(false)
  useEffect(() => setInFrame(window.parent !== window), [])
  if (!inFrame) return null
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={window.location.origin} />
}
