'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useField, FieldLabel } from '@payloadcms/ui';
import { countries } from '../../countries.js';
import './index.scss';
function FlagImage({ code, size = 20 }) {
    return (_jsx("img", { src: `/api/geo-visibility/flags/${code}.svg`, alt: "", width: size, height: Math.round(size * 0.75), loading: "lazy", className: "geo-visibility-flag" }));
}
export const GeoVisibilitySelect = ({ field, path }) => {
    const { value, setValue } = useField({ path });
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const selectedCodes = value || [];
    const selectedCountries = selectedCodes
        .map((code) => countries.find((c) => c.code === code))
        .filter((c) => c != null);
    const filteredCountries = countries.filter((country) => {
        if (selectedCodes.includes(country.code))
            return false;
        if (!search)
            return true;
        const q = search.toLowerCase();
        return country.name.toLowerCase().includes(q) || country.code.toLowerCase().includes(q);
    });
    const addCountry = useCallback((code) => {
        setValue([...selectedCodes, code]);
        setSearch('');
    }, [selectedCodes, setValue]);
    const removeCountry = useCallback((code) => {
        setValue(selectedCodes.filter((c) => c !== code));
    }, [selectedCodes, setValue]);
    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);
    return (_jsxs("div", { className: "geo-visibility-field", children: [_jsx(FieldLabel, { label: field.label || 'Geo Visibility', path: path }), field.admin?.description && (_jsx("div", { className: "field-description", children: field.admin.description })), _jsx("div", { className: "geo-visibility-selected", children: selectedCountries.length === 0 ? (_jsx("span", { className: "geo-visibility-empty", children: "Visible everywhere (no restriction)" })) : (selectedCountries.map((country) => (_jsxs("span", { className: "geo-visibility-pill", children: [_jsx(FlagImage, { code: country.code, size: 16 }), _jsx("span", { children: country.name }), _jsx("button", { type: "button", className: "geo-visibility-pill-remove", onClick: () => removeCountry(country.code), "aria-label": `Remove ${country.name}`, children: "\u00D7" })] }, country.code)))) }), _jsxs("div", { className: "geo-visibility-dropdown-wrapper", ref: dropdownRef, children: [_jsx("button", { type: "button", className: "geo-visibility-add-btn", onClick: () => setIsOpen(!isOpen), children: "+ Add country" }), isOpen && (_jsxs("div", { className: "geo-visibility-dropdown", children: [_jsx("input", { ref: searchInputRef, type: "text", className: "geo-visibility-search", placeholder: "Search countries...", value: search, onChange: (e) => setSearch(e.target.value) }), _jsx("ul", { className: "geo-visibility-list", children: filteredCountries.length === 0 ? (_jsx("li", { className: "geo-visibility-list-empty", children: "No countries found" })) : (filteredCountries.map((country) => (_jsx("li", { children: _jsxs("button", { type: "button", className: "geo-visibility-list-item", onClick: () => addCountry(country.code), children: [_jsx(FlagImage, { code: country.code, size: 20 }), _jsx("span", { children: country.name }), _jsx("span", { className: "geo-visibility-code", children: country.code.toUpperCase() })] }) }, country.code)))) })] }))] })] }));
};
export default GeoVisibilitySelect;
//# sourceMappingURL=index.js.map