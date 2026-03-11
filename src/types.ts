export type GeoVisibilityPluginConfig = {
  collections: Record<string, string[]>
  fieldName?: string
}

export interface Country {
  code: string
  name: string
}
