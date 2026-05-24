<?php

return [
    'name'      => env('APP_NAME', 'Laravel'),
    'env'       => env('APP_ENV', 'production'),
    'debug'     => (bool) env('APP_DEBUG', false),
    'url'       => env('APP_URL', 'http://localhost'),
    /*
    | Set true behind SSL-terminating reverse proxies when generated URLs must be HTTPS
    | (DirectAdmin/OpenLiteSpeed/Cloudflare): often used with APP_URL=https://...
    */
    'force_https' => filter_var(env('APP_FORCE_HTTPS', false), FILTER_VALIDATE_BOOLEAN),
    'timezone'  => 'UTC',
    'locale'    => 'en',
    'fallback_locale' => 'en',
    'faker_locale'    => 'en_US',
    'cipher'    => 'AES-256-CBC',
    'key'       => env('APP_KEY'),
    'previous_keys' => array_filter(explode(',', env('APP_PREVIOUS_KEYS', ''))),
    'maintenance' => [
        'driver' => 'file',
    ],
];
