'use client';
import { useGeo } from '../providers/GeoProvider.js';
import { filterByGeo } from '../utils/filterByGeo.js';
export function useGeoFilter(items, fieldName = 'geoVisibility') {
    const { countryCode, loading } = useGeo();
    return filterByGeo(items, countryCode, fieldName, loading);
}
//# sourceMappingURL=useGeoFilter.js.map