<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Events\DiagnosingHealth;
use Illuminate\Http\JsonResponse;
/**
 * GET /up — replaces Laravel's closure-based health route so route caching works in production.
 * Behaviour mirrors Laravel's lightweight health check (DiagnosingHealth, non-debug errors reported).
 */
final class SystemHealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $exceptionMessage = null;

        try {
            Event::dispatch(new DiagnosingHealth);
        } catch (\Throwable $e) {
            if (app()->hasDebugModeEnabled()) {
                throw $e;
            }
            report($e);
            $exceptionMessage = $e->getMessage();
        }

        if ($exceptionMessage !== null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Health check failed.',
            ], 500);
        }

        return response()->json(['status' => 'success', 'data' => ['ok' => true]]);
    }
}
