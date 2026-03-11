'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface GeoContextValue {
  countryCode: string | null
  loading: boolean
}

const GeoContext = createContext<GeoContextValue>({
  countryCode: null,
  loading: true,
})

export function useGeo(): GeoContextValue {
  return useContext(GeoContext)
}

interface GeoProviderProps {
  children: React.ReactNode
  overrideCountry?: string | null
}

export function GeoProvider({ children, overrideCountry }: GeoProviderProps) {
  const [countryCode, setCountryCode] = useState<string | null>(overrideCountry ?? null)
  const [loading, setLoading] = useState(overrideCountry == null)

  useEffect(() => {
    if (overrideCountry != null) {
      setCountryCode(overrideCountry)
      setLoading(false)
      return
    }

    let cancelled = false

    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then((res) => res.json())
      .then((data: { country_code?: string }) => {
        if (!cancelled && data.country_code) {
          setCountryCode(data.country_code.toLowerCase())
        }
      })
      .catch(() => {
        // Fail-open: leave countryCode as null so everything stays visible
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [overrideCountry])

  return <GeoContext.Provider value={{ countryCode, loading }}>{children}</GeoContext.Provider>
}
