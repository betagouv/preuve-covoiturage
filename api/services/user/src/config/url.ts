declare function env(key: string, fallback?: string): any;

export const apiUrl = env('APP_API_URL', 'nope');
export const appUrl = env('APP_APP_URL') ? env('APP_APP_URL') : apiUrl.replace('api', 'dashboard');
