<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * JSON 404 for unknown /api/* routes (explicit controller for route caching).
 */
final class ApiFallbackController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status'  => 'error',
            'message' => 'Endpoint not found.',
        ], 404);
    }
}
