import { useMemo } from 'react'
import { getStartAppParam } from '../lib/deep-link'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function useDeepLink(): { shopId: string | null } {
  const shopId = useMemo(() => {
    const param = getStartAppParam()
    if (!param || !UUID_RE.test(param)) return null
    return param
  }, [])

  return { shopId }
}
