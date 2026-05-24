<?php

$rawOrigins = (string) env('CORS_ALLOWED_ORIGINS', '*');
$supportsCredentials = filter_var(env('CORS_SUPPORTS_CREDENTIALS', true), FILTER_VALIDATE_BOOLEAN);

/*
| Credentials + wildcard origins are invalid together in browsers.
| In production (.env.production.example) use an explicit HTTPS origin list.
| If callers still combine `*` + credentials, we tighten to scheme+host from APP_URL only.
*/
$parsedOrigins = array_values(array_filter(
    array_map(
        static fn (string $o): ?string => ($t = trim($o)) !== '' ? $t : null,
        explode(',', $rawOrigins),
    ),
));

$allowedOrigins = $parsedOrigins !== [] ? $parsedOrigins : ['*'];

if ($supportsCredentials === true && $allowedOrigins === ['*']) {
    $appUrl = (string) env('APP_URL', '');
    $scheme = parse_url($appUrl, PHP_URL_SCHEME) ?: 'https';
    $host = parse_url($appUrl, PHP_URL_HOST);
    if (is_string($host) && $host !== '') {
        $allowedOrigins = [(string) $scheme.'://'.$host];
    }
}

return [
    /*
    | Capacitor Android (default androidScheme=https) sends Origin: https://localhost
    | Older stacks may send capacitor://localhost — include both in CORS_ALLOWED_ORIGINS.
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => $supportsCredentials,
];
