'use client'

import { useGeo } from '../providers/GeoProvider.js'
import { filterByGeo } from '../utils/filterByGeo.js'

export function useGeoFilter<T extends Record<string, unknown>>(
  items: T[],
  fieldName = 'geoVisibility',
): T[] {
  const { countryCode, loading } = useGeo()
  return filterByGeo(items, countryCode, fieldName, loading)
}
