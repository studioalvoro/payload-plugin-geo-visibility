import React from 'react';
interface GeoContextValue {
    countryCode: string | null;
    loading: boolean;
}
export declare function useGeo(): GeoContextValue;
interface GeoProviderProps {
    children: React.ReactNode;
    overrideCountry?: string | null;
}
export declare function GeoProvider({ children, overrideCountry }: GeoProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GeoProvider.d.ts.map