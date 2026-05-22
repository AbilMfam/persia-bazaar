<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    /**
     * Standard success envelope.
     */
    protected function success(mixed $data = [], int $status = 200, array $meta = []): \Illuminate\Http\JsonResponse
    {
        $payload = ['status' => 'success', 'data' => $data];
        if (! empty($meta)) {
            $payload['meta'] = $meta;
        }
        return response()->json($payload, $status);
    }

    /**
     * Standard error envelope.
     */
    protected function error(string $message, int $status = 400, array $errors = []): \Illuminate\Http\JsonResponse
    {
        $payload = ['status' => 'error', 'message' => $message];
        if (! empty($errors)) {
            $payload['errors'] = $errors;
        }
        return response()->json($payload, $status);
    }
}
