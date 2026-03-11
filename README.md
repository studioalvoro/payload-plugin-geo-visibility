# payload-plugin-geo-visibility

Payload CMS 3 plugin for country-based content visibility.

## Features

- Injects a geo-visibility field into any array field via config
- Custom admin component with searchable country picker + flag icons
- 268 countries/regions with SVG flags
- Client-side geo detection via [GeoJS](https://www.geojs.io/) (free, no API key)
- React hook + pure utility for frontend filtering
- Fail-open: blocked GeoJS = everything visible
- No flash: geo-restricted items hidden until detection completes

## Installation

```bash
pnpm add payload-plugin-geo-visibility
```

### Peer dependencies

```
payload ^3.0.0
@payloadcms/ui ^3.0.0
react ^19.0.0
```

## Quick Start

### 1. Add the plugin to your Payload config

```ts
// payload.config.ts
import { geoVisibilityPlugin } from 'payload-plugin-geo-visibility'

export default buildConfig({
  plugins: [
    geoVisibilityPlugin({
      collections: {
        pages: ['hero.slides', 'content.items'],
        settings: ['footer.links'],
      },
    }),
  ],
  // ...
})
```

### 2. Regenerate the import map

```bash
pnpm generate:importmap
```

### 3. Wrap your frontend layout with `<GeoProvider>`

```tsx
// app/layout.tsx (or any layout wrapping your content)
import { GeoProvider } from 'payload-plugin-geo-visibility/react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GeoProvider>{children}</GeoProvider>
}
```

That's it — array items in the configured fields now have a "Geo Visibility" selector in the admin panel, and your frontend filters them by the visitor's country.

## Plugin Configuration

```ts
geoVisibilityPlugin({
  collections: Record<string, string[]>,
  fieldName?: string, // default: 'geoVisibility'
})
```

### `collections`

Maps collection slugs to arrays of dot-notation field paths. Each path points to an **array** field where the geo-visibility selector will be injected.

```ts
collections: {
  pages: ['hero.slides'],
  //       ^^^^^^^^^^^
  //       Traverses: pages → fields.hero (group) → fields.slides (array)
  //       Injects geoVisibility into each slides array item
}
```

During traversal the plugin walks through `group`, `array`, and `tabs` field types to reach the target array field.

### `fieldName`

Override the default field name (`'geoVisibility'`) if it conflicts with an existing field in your schema.

## Frontend Usage

### GeoProvider

Wrap your app (or the part that needs geo-filtering) with `<GeoProvider>`. It detects the visitor's country via GeoJS and makes it available through context.

```tsx
import { GeoProvider } from 'payload-plugin-geo-visibility/react'

// Basic usage — auto-detects country
<GeoProvider>{children}</GeoProvider>

// Override for testing
<GeoProvider overrideCountry="us">{children}</GeoProvider>
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `children` | `React.ReactNode` | Required |
| `overrideCountry` | `string \| null` | Skip GeoJS and use this country code instead |

### useGeo

Access the geo context directly.

```tsx
'use client'
import { useGeo } from 'payload-plugin-geo-visibility/react'

function MyComponent() {
  const { countryCode, loading } = useGeo()
  // countryCode: 'us' | 'pt' | null
  // loading: true while detecting
}
```

### useGeoFilter

Filter an array of items by the visitor's country. Must be used inside `<GeoProvider>`.

```tsx
'use client'
import { useGeoFilter } from 'payload-plugin-geo-visibility/react'

function Links({ items }: { items: LinkItem[] }) {
  const visibleItems = useGeoFilter<LinkItem>(items)

  return (
    <ul>
      {visibleItems.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  )
}
```

**Signature:**

```ts
function useGeoFilter<T extends Record<string, unknown>>(
  items: T[],
  fieldName?: string, // default: 'geoVisibility'
): T[]
```

### filterByGeo

Pure function — no React dependency. Use this when you can't use hooks (loops, non-React contexts, etc.).

```ts
import { filterByGeo } from 'payload-plugin-geo-visibility/react'

const visible = filterByGeo(items, countryCode)
```

**Signature:**

```ts
function filterByGeo<T extends Record<string, unknown>>(
  items: T[],
  countryCode: string | null,
  fieldName?: string,  // default: 'geoVisibility'
  loading?: boolean,   // default: false
): T[]
```

## Visibility Rules

| `geoVisibility` | `countryCode` | `loading` | Result |
|---|---|---|---|
| `[]` or missing | any | any | **Visible** — no restriction |
| `['pt', 'es']` | `'pt'` | `false` | **Visible** — country matches |
| `['pt', 'es']` | `'us'` | `false` | **Hidden** — country doesn't match |
| `['pt', 'es']` | `null` | `false` | **Hidden** — detection failed, restricted items stay hidden |
| `['pt', 'es']` | `null` | `true` | **Hidden** — still loading, prevents flash |

Items with no restriction (empty or missing `geoVisibility`) are **always visible**, regardless of country or loading state.

## Admin UI

The field appears as **"Geo Visibility"** inside each array item in the Payload admin panel.

- **Empty state:** "Visible everywhere (no restriction)"
- **Selected countries:** Shown as removable pill badges with flag icons
- **Dropdown:** Searchable by country name or code, with flags
- **Flags:** Served via `/api/geo-visibility/flags/:code.svg` with immutable caching (`Cache-Control: public, max-age=31536000, immutable`)

## Exports

| Entry Point | Exports |
|---|---|
| `payload-plugin-geo-visibility` | `geoVisibilityPlugin`, `countries`, `GeoVisibilityPluginConfig`, `Country` |
| `payload-plugin-geo-visibility/client` | `GeoVisibilitySelect` (admin component) |
| `payload-plugin-geo-visibility/react` | `GeoProvider`, `useGeo`, `useGeoFilter`, `filterByGeo` |

## Testing with overrideCountry

Use the `overrideCountry` prop to simulate different countries during development:

```tsx
// Simulate a visitor from the US
<GeoProvider overrideCountry="us">{children}</GeoProvider>

// Simulate detection failure (no country detected)
<GeoProvider overrideCountry="">{children}</GeoProvider>

// Normal auto-detection
<GeoProvider>{children}</GeoProvider>
```

## License

MIT
