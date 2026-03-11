export function filterByGeo<T extends Record<string, unknown>>(
  items: T[],
  countryCode: string | null,
  fieldName = 'geoVisibility',
  loading = false,
): T[] {
  return items.filter((item) => {
    const visibility = item[fieldName]
    if (!Array.isArray(visibility) || visibility.length === 0) return true
    // While loading, hide geo-restricted items to prevent flash
    if (loading || !countryCode) return false
    return visibility.includes(countryCode)
  })
}
