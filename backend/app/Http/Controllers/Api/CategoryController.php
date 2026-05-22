<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * GET /api/categories — list for storefront (slug matches frontend `category.id`).
     */
    public function index(): JsonResponse
    {
        $rows = Category::query()
            ->orderBy('slug')
            ->get(['slug', 'name']);

        return $this->success($rows->toArray());
    }
}
