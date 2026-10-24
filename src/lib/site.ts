import { headers } from 'next/headers'

/**
 * The only addresses search engines may index. Everything else — the *.vercel.app address, previews — stays
 * "noindex", so the new site opens to Google by itself the day mymuse.co.il points here, and never before
 * (the old WordPress site keeps ranking until then).
 */
export const LIVE_HOSTS = ['mymuse.co.il', 'www.mymuse.co.il']

export const isLiveHost = (host: string | null | undefined) => LIVE_HOSTS.includes((host || '').split(':')[0].toLowerCase())

/** Whether the current request may be indexed (server components / metadata / route handlers). */
export const indexable = async () => isLiveHost((await headers()).get('host'))
