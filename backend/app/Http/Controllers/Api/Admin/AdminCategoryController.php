<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function __construct(private CategoryRepositoryInterface $categories) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->categories->allWithCount()]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['slug'] = Str::slug($validated['name']);

        return response()->json([
            'message' => 'Catégorie créée.',
            'data' => $this->categories->create($validated),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);
        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        $updated = $this->categories->update($category, $validated);

        return response()->json([
            'message' => 'Catégorie mise à jour.',
            'data' => $updated,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->categories->delete(Category::findOrFail($id));

        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}
