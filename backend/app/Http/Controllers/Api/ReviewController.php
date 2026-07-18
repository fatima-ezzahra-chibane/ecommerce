<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    public function index(int $productId): JsonResponse
    {
        $reviews = Review::where('product_id', $productId)
            ->with('user')
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function store(StoreReviewRequest $request, int $productId): JsonResponse
    {
        Product::active()->findOrFail($productId);

        $validated = $request->validated();

        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing?->image && str_contains($existing->image, '/storage/reviews/')) {
            $old = str_replace('/storage/', '', $existing->image);
            Storage::disk('public')->delete($old);
        }

        $data = [
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('reviews', 'public');
            $data['image'] = '/storage/'.$path;
        }

        $review = Review::updateOrCreate(
            ['user_id' => $request->user()->id, 'product_id' => $productId],
            $data
        );

        return response()->json([
            'message' => 'Avis enregistré.',
            'data' => new ReviewResource($review->load('user')),
        ], 201);
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        $review = Review::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->first();

        if ($review?->image && str_contains($review->image, '/storage/reviews/')) {
            $old = str_replace('/storage/', '', $review->image);
            Storage::disk('public')->delete($old);
        }

        $review?->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }
}
