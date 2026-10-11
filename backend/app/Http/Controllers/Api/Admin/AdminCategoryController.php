<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Models\Category;
use App\Models\OrderItem;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

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
        $validated['slug'] = $this->uniqueSlug($validated['name']);

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
            $validated['slug'] = $this->uniqueSlug($validated['name'], $category->id);
        }
        $updated = $this->categories->update($category, $validated);

        return response()->json([
            'message' => 'Catégorie mise à jour.',
            'data' => $updated,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if (OrderItem::whereHas('product', fn ($q) => $q->where('category_id', $category->id))->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer cette catégorie : elle contient des produits déjà commandés. Désactivez ces produits à la place.',
            ], 422);
        }

        $this->categories->delete($category);

        return response()->json(['message' => 'Catégorie supprimée.']);
    }

    /** « Électronique » et « Electronique » donnent le même slug : refus explicite plutôt qu'une erreur SQL. */
    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);

        $taken = Category::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        if ($taken) {
            throw ValidationException::withMessages(['name' => ['Une catégorie avec ce nom existe déjà.']]);
        }

        return $slug;
    }
}
