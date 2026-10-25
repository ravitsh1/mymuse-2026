import { revalidatePath } from 'next/cache'

/** Refresh cached pages after an edit. Silent outside a Next.js request (seed script, CLI). */
export function refresh(path: string, type?: 'page' | 'layout') {
  try {
    if (type) revalidatePath(path, type)
    else revalidatePath(path)
  } catch {
    /* not running inside Next.js */
  }
}

/** Every page lists the projects (header count, "next project"), so refresh the whole site. */
export const refreshSite = () => refresh('/', 'layout')
