import type { Field } from 'payload'

export function injectGeoField(fields: Field[], dotPath: string, geoField: Field): Field[] {
  const segments = dotPath.split('.')
  return traverseAndInject(fields, segments, geoField)
}

function traverseAndInject(fields: Field[], segments: string[], geoField: Field): Field[] {
  if (segments.length === 0) return fields

  const [current, ...remaining] = segments

  return fields.map((field) => {
    // Handle tabs field type: search inside each tab's fields
    if (field.type === 'tabs') {
      return {
        ...field,
        tabs: field.tabs.map((tab) => ({
          ...tab,
          fields: traverseAndInject(tab.fields, segments, geoField),
        })),
      }
    }

    if (!('name' in field) || field.name !== current) return field

    // Final segment: inject into array fields
    if (remaining.length === 0) {
      if (field.type === 'array') {
        return {
          ...field,
          fields: [...field.fields, geoField],
        }
      }
      return field
    }

    // Intermediate segment: recurse into group or array fields
    if (field.type === 'group' || field.type === 'array') {
      return {
        ...field,
        fields: traverseAndInject(field.fields, remaining, geoField),
      }
    }

    return field
  })
}
