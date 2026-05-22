<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products/mine — current user's products (auth).
     */
    public function mine(Request $request): JsonResponse
    {
        $products = $request->user()->products()->latest('id')->get();

        return $this->success(ProductResource::collection($products)->resolve());
    }

    /**
     * GET /api/products — paginated list (public).
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) min(max((int) $request->query('per_page', 15), 1), 100);
        $search   = trim((string) $request->query('q', ''));
        $category = trim((string) $request->query('category', ''));

        $query = Product::query()->latest('id');

        if ($category !== '') {
            $query->where('category', $category);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($perPage);

        return $this->success(
            ProductResource::collection($paginator)->resolve(),
            200,
            [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        );
    }

    /**
     * POST /api/products — create (auth).
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $request->user()->products()->create($request->validated());

        return $this->success(new ProductResource($product), 201);
    }

    /**
     * GET /api/products/{product} — single (public).
     */
    public function show(Product $product): JsonResponse
    {
        return $this->success(new ProductResource($product));
    }

    /**
     * PUT/PATCH /api/products/{product} — update (owner only).
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        return $this->success(new ProductResource($product->fresh()));
    }

    /**
     * DELETE /api/products/{product} — delete (owner only).
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        if (! $request->user() || $product->user_id !== $request->user()->id) {
            return $this->error('You are not allowed to delete this product.', 403);
        }

        $product->delete();

        return $this->success(['deleted' => true]);
    }
}
