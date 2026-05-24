<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // HTTPS redirects and *_url helpers on shared hosts behind terminating TLS (paired with APP_URL/TRUST_ALL_PROXIES).
        $forceHttps = filter_var(env('APP_FORCE_HTTPS', false), FILTER_VALIDATE_BOOLEAN);
        $appUrl = (string) config('app.url', '');
        $urlIsHttps = str_starts_with($appUrl, 'https://');
        $prodLike = config('app.env') === 'production' || ($this->app->environment('staging'));
        if ($forceHttps === true || ($prodLike === true && $urlIsHttps)) {
            URL::forceScheme('https');
        }
    }
}
