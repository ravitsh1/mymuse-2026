import React from 'react'
import { LogoStacked } from '../Logo'

/** Login-screen logo. */
export const Logo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
    <span role="img" aria-label="MyMuse" style={{ display: 'block', lineHeight: 0 }}>
      <LogoStacked style={{ width: 140, height: 140 }} />
    </span>
    <span style={{ fontSize: 15, opacity: 0.6 }}>ניהול האתר</span>
  </div>
)

/** Small mark in the sidebar / breadcrumbs. */
export const Icon = () => (
  <span role="img" aria-label="MyMuse" style={{ display: 'block', lineHeight: 0 }}>
    <LogoStacked style={{ width: 30, height: 30 }} />
  </span>
)
