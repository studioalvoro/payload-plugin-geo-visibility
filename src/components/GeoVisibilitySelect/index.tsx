'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'
import { countries } from '../../countries.js'
import type { Country } from '../../types.js'
import './index.scss'

function FlagImage({ code, size = 20 }: { code: string; size?: number }) {
  return (
    <img
      src={`/api/geo-visibility/flags/${code}.svg`}
      alt=""
      width={size}
      height={Math.round(size * 0.75)}
      loading="lazy"
      className="geo-visibility-flag"
    />
  )
}

interface GeoVisibilitySelectProps {
  field: {
    name: string
    label?: string
    admin?: {
      description?: string
    }
  }
  path: string
}

export const GeoVisibilitySelect: React.FC<GeoVisibilitySelectProps> = ({ field, path }) => {
  const { value, setValue } = useField<string[]>({ path })
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedCodes = value || []

  const selectedCountries = selectedCodes
    .map((code) => countries.find((c) => c.code === code))
    .filter((c): c is Country => c != null)

  const filteredCountries = countries.filter((country) => {
    if (selectedCodes.includes(country.code)) return false
    if (!search) return true
    const q = search.toLowerCase()
    return country.name.toLowerCase().includes(q) || country.code.toLowerCase().includes(q)
  })

  const addCountry = useCallback(
    (code: string) => {
      setValue([...selectedCodes, code])
      setSearch('')
    },
    [selectedCodes, setValue],
  )

  const removeCountry = useCallback(
    (code: string) => {
      setValue(selectedCodes.filter((c) => c !== code))
    },
    [selectedCodes, setValue],
  )

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div className="geo-visibility-field">
      <FieldLabel label={field.label || 'Geo Visibility'} path={path} />

      {field.admin?.description && (
        <div className="field-description">{field.admin.description}</div>
      )}

      {/* Selected countries */}
      <div className="geo-visibility-selected">
        {selectedCountries.length === 0 ? (
          <span className="geo-visibility-empty">Visible everywhere (no restriction)</span>
        ) : (
          selectedCountries.map((country) => (
            <span key={country.code} className="geo-visibility-pill">
              <FlagImage code={country.code} size={16} />
              <span>{country.name}</span>
              <button
                type="button"
                className="geo-visibility-pill-remove"
                onClick={() => removeCountry(country.code)}
                aria-label={`Remove ${country.name}`}
              >
                &times;
              </button>
            </span>
          ))
        )}
      </div>

      {/* Add country dropdown */}
      <div className="geo-visibility-dropdown-wrapper" ref={dropdownRef}>
        <button
          type="button"
          className="geo-visibility-add-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          + Add country
        </button>

        {isOpen && (
          <div className="geo-visibility-dropdown">
            <input
              ref={searchInputRef}
              type="text"
              className="geo-visibility-search"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ul className="geo-visibility-list">
              {filteredCountries.length === 0 ? (
                <li className="geo-visibility-list-empty">No countries found</li>
              ) : (
                filteredCountries.map((country) => (
                  <li key={country.code}>
                    <button
                      type="button"
                      className="geo-visibility-list-item"
                      onClick={() => addCountry(country.code)}
                    >
                      <FlagImage code={country.code} size={20} />
                      <span>{country.name}</span>
                      <span className="geo-visibility-code">{country.code.toUpperCase()}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default GeoVisibilitySelect
