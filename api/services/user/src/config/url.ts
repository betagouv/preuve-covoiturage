declare function env(key: string, fallback?: string): any;

export const apiUrl = env('API_URL', 'nope');
export const appUrl = env('APP_URL') ? env('APP_URL') : apiUrl.replace('api', 'dashboard');
