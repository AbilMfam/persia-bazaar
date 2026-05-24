{{-- Minimal placeholder — API-focused app has no Blade UI; satisfies view stack / tooling expectations. --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'DigiMall') }}</title>
</head>
<body>
    <p>API backend — use <code>/api/*</code> routes.</p>
</body>
</html>
