let lastPagePath: string | null = null

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>

export function trackPageView(path: string) {
  if (!window.gtag || lastPagePath === path) {
    return
  }

  lastPagePath = path
  window.gtag('event', 'page_view', { page_path: path })
}

export function trackEvent(name: string, params?: AnalyticsParams) {
  if (!window.gtag) {
    return
  }

  window.gtag('event', name, params ?? {})
}
