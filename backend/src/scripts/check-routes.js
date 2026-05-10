import app from '../app.js';

const expectedRoutes = [
    'GET /api/tasks/',
    'POST /api/tasks/',
    'GET /api/tasks/:id',
    'PUT /api/tasks/:id',
    'PATCH /api/tasks/:id/status',
    'GET /api/tasks/:id/attachments/:index',
    'DELETE /api/tasks/:id/attachments/:index',
    'DELETE /api/tasks/:id',
    'GET /api/projects/',
    'POST /api/projects/',
    'GET /api/projects/:id',
    'PUT /api/projects/:id',
    'GET /api/projects/:id/thumbnail',
    'DELETE /api/projects/:id/thumbnail',
    'DELETE /api/projects/:id',
    'GET /api/folders/',
    'POST /api/folders/',
    'GET /api/folders/:id',
    'PUT /api/folders/:id',
    'DELETE /api/folders/:id',
    'GET /api/folders/:id/contents',
];

const collectRoutes = (stack, prefix = '') => {
    const routes = [];

    stack.forEach((layer) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).map((method) => method.toUpperCase());
            methods.forEach((method) => routes.push(`${method} ${prefix}${layer.route.path}`));
            return;
        }

        if (layer.name === 'router' && layer.handle?.stack) {
            const match = String(layer.regexp).match(/\\\/api\\\/([^\\/?]+)/);
            const nextPrefix = match ? `/api/${match[1]}` : prefix;
            routes.push(...collectRoutes(layer.handle.stack, nextPrefix));
        }
    });

    return routes;
};

const routes = collectRoutes(app._router.stack);
const missing = expectedRoutes.filter((route) => !routes.includes(route));

if (missing.length > 0) {
    console.error('Missing expected routes:');
    missing.forEach((route) => console.error(`- ${route}`));
    process.exit(1);
}

console.log(`Route check passed. Verified ${expectedRoutes.length} routes.`);
