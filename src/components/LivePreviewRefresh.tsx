'use client'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

/** Inside the admin's live-preview pane: re-render the page whenever the editor saves. */
export function LivePreviewRefresh() {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={typeof window !== 'undefined' ? window.location.origin : ''} />
}
