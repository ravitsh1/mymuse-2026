import React from 'react'

const word: React.CSSProperties = { fontFamily: 'Karantina, Assistant, sans-serif', fontWeight: 700, direction: 'ltr', lineHeight: 1 }

/** Login-screen logo. */
export const Logo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
    <span style={{ ...word, fontSize: 64 }}>
      My<span style={{ color: '#d6a05b' }}>Muse</span>
    </span>
    <span style={{ fontSize: 15, opacity: 0.6 }}>ניהול האתר</span>
  </div>
)

/** Small mark in the sidebar / breadcrumbs. */
export const Icon = () => (
  <span style={{ ...word, fontSize: 26 }}>
    M<span style={{ color: '#d6a05b' }}>M</span>
  </span>
)
