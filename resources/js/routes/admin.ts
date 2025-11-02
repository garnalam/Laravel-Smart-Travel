import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../wayfinder';

/**
 * Admin dashboard route
 * @route '/admin'
 */
export const admin = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: admin.url(options),
    method: 'get',
});

admin.definition = {
    methods: ["get", "head"],
    url: '/admin',
} satisfies RouteDefinition<["get", "head"]>;

admin.url = (options?: RouteQueryOptions) => {
    return admin.definition.url + queryParams(options);
};

/**
 * Admin users route
 * @route '/admin/users'
 */
export const adminUsers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: adminUsers.url(options),
    method: 'get',
});

adminUsers.definition = {
    methods: ["get", "head"],
    url: '/admin/users',
} satisfies RouteDefinition<["get", "head"]>;

adminUsers.url = (options?: RouteQueryOptions) => {
    return adminUsers.definition.url + queryParams(options);
};

/**
 * Admin analytics route
 * @route '/admin/analytics'
 */
export const adminAnalytics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: adminAnalytics.url(options),
    method: 'get',
});

adminAnalytics.definition = {
    methods: ["get", "head"],
    url: '/admin/analytics',
} satisfies RouteDefinition<["get", "head"]>;

adminAnalytics.url = (options?: RouteQueryOptions) => {
    return adminAnalytics.definition.url + queryParams(options);
};

/**
 * Admin settings route
 * @route '/admin/settings'
 */
export const adminSettings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: adminSettings.url(options),
    method: 'get',
});

adminSettings.definition = {
    methods: ["get", "head"],
    url: '/admin/settings',
} satisfies RouteDefinition<["get", "head"]>;

adminSettings.url = (options?: RouteQueryOptions) => {
    return adminSettings.definition.url + queryParams(options);
};