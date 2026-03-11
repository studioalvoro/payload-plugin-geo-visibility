import type { Config, Endpoint, Plugin } from 'payload'
import { countries } from './countries.js'
import { injectGeoField } from './field-injection.js'
import type { GeoVisibilityPluginConfig } from './types.js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

export type { GeoVisibilityPluginConfig, Country } from './types.js'
export { countries } from './countries.js'

export const geoVisibilityPlugin =
  (pluginConfig: GeoVisibilityPluginConfig): Plugin =>
  (config: Config): Config => {
    const fieldName = pluginConfig.fieldName || 'geoVisibility'

    const geoField = {
      name: fieldName,
      type: 'select' as const,
      hasMany: true,
      options: countries.map((c) => ({ label: c.name, value: c.code })),
      admin: {
        description: 'Restrict visibility to selected countries. Leave empty to show everywhere.',
        components: {
          Field: 'payload-plugin-geo-visibility/client#GeoVisibilitySelect',
        },
      },
    }

    const flagEndpoint: Endpoint = {
      path: '/geo-visibility/flags/:code',
      method: 'get',
      handler: (req) => {
        const code = (req.routeParams?.code as string | undefined)?.replace(/\.svg$/, '')

        if (!code || !/^[a-z]{2}(-[a-z]+)?$/.test(code)) {
          return new Response('Not found', { status: 404 })
        }

        try {
          const __dirname = dirname(fileURLToPath(import.meta.url))
          const flagPath = resolve(__dirname, '..', 'flags', `${code}.svg`)
          const svg = readFileSync(flagPath, 'utf-8')

          return new Response(svg, {
            status: 200,
            headers: {
              'Content-Type': 'image/svg+xml',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          })
        } catch {
          return new Response('Not found', { status: 404 })
        }
      },
    }

    return {
      ...config,
      endpoints: [...(config.endpoints || []), flagEndpoint],
      collections: (config.collections || []).map((collection) => {
        const paths = pluginConfig.collections[collection.slug]
        if (!paths) return collection

        let fields = [...collection.fields]
        for (const path of paths) {
          fields = injectGeoField(fields, path, geoField)
        }

        return { ...collection, fields }
      }),
    }
  }
