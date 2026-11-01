import posthog from 'posthog-js'
import { analyticsEnabled } from './analytics'

// This module is the only source of PostHog Logs records for the portfolio.
export function logApplicationMounted() {
  if (!analyticsEnabled) return
  posthog.logger.info('portfolio application mounted', { entry_point: 'spa' })
}

export function logInteractiveFallback(feature: 'globe' | 'desk') {
  if (!analyticsEnabled) return
  posthog.logger.warn('interactive experience unavailable', { feature })
}
