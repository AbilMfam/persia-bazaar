<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'success', 'data' => ['ok' => true]]));

// Auth
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });
});

Route::get('/categories', [CategoryController::class, 'index']);

// Products — read is public, writes require auth.
Route::middleware('auth:sanctum')->get('/products/mine', [ProductController::class, 'mine']);
Route::get('/products',          [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/products',          [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
});

// Catch-all 404 for /api/* (JSON envelope handled in bootstrap/app.php).
Route::fallback(fn () => response()->json([
    'status'  => 'error',
    'message' => 'Endpoint not found.',
], 404));
