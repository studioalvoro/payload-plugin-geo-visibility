'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const GeoContext = createContext({
    countryCode: null,
    loading: true,
});
export function useGeo() {
    return useContext(GeoContext);
}
export function GeoProvider({ children, overrideCountry }) {
    const [countryCode, setCountryCode] = useState(overrideCountry ?? null);
    const [loading, setLoading] = useState(overrideCountry == null);
    useEffect(() => {
        if (overrideCountry != null) {
            setCountryCode(overrideCountry);
            setLoading(false);
            return;
        }
        let cancelled = false;
        fetch('https://get.geojs.io/v1/ip/geo.json')
            .then((res) => res.json())
            .then((data) => {
            if (!cancelled && data.country_code) {
                setCountryCode(data.country_code.toLowerCase());
            }
        })
            .catch(() => {
            // Fail-open: leave countryCode as null so everything stays visible
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [overrideCountry]);
    return _jsx(GeoContext.Provider, { value: { countryCode, loading }, children: children });
}
//# sourceMappingURL=GeoProvider.js.map