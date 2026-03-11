import { countries } from './countries.js';
import { injectGeoField } from './field-injection.js';
import { flagsMap } from './flags-inline.js';
export { countries } from './countries.js';
export const geoVisibilityPlugin = (pluginConfig) => (config) => {
    const fieldName = pluginConfig.fieldName || 'geoVisibility';
    const geoField = {
        name: fieldName,
        type: 'select',
        hasMany: true,
        options: countries.map((c) => ({ label: c.name, value: c.code })),
        admin: {
            description: 'Restrict visibility to selected countries. Leave empty to show everywhere.',
            components: {
                Field: 'payload-plugin-geo-visibility/client#GeoVisibilitySelect',
            },
        },
    };
    const flagEndpoint = {
        path: '/geo-visibility/flags/:code',
        method: 'get',
        handler: (req) => {
            const code = req.routeParams?.code?.replace(/\.svg$/, '');
            if (!code || !/^[a-z]{2}(-[a-z]+)?$/.test(code)) {
                return new Response('Not found', { status: 404 });
            }
            const svg = flagsMap.get(code);
            if (!svg) {
                return new Response('Not found', { status: 404 });
            }
            return new Response(svg, {
                status: 200,
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        },
    };
    return {
        ...config,
        endpoints: [...(config.endpoints || []), flagEndpoint],
        collections: (config.collections || []).map((collection) => {
            const paths = pluginConfig.collections[collection.slug];
            if (!paths)
                return collection;
            let fields = [...collection.fields];
            for (const path of paths) {
                fields = injectGeoField(fields, path, geoField);
            }
            return { ...collection, fields };
        }),
    };
};
//# sourceMappingURL=index.js.map