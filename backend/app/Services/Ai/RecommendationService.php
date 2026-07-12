<?php

namespace App\Services\Ai;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Support\Collection;

class RecommendationService
{
    public function forProduct(Product $product, int $limit = 4): Collection
    {
        $sameCategory = Product::query()
            ->active()
            ->where('id', '!=', $product->id)
            ->where('category_id', $product->category_id)
            ->with(['category'])
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        if ($sameCategory->count() >= $limit) {
            return $sameCategory;
        }

        $exclude = $sameCategory->pluck('id')->push($product->id);

        $fill = Product::query()
            ->active()
            ->whereNotIn('id', $exclude)
            ->with(['category'])
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit - $sameCategory->count())
            ->get();

        return $sameCategory->concat($fill);
    }

    public function forUser(?User $user, int $limit = 8): Collection
    {
        if (! $user) {
            return Product::query()
                ->active()
                ->with(['category'])
                ->withAvg('reviews', 'rating')
                ->orderByDesc('reviews_avg_rating')
                ->orderByDesc('created_at')
                ->limit($limit)
                ->get();
        }

        $categoryIds = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->where('user_id', $user->id))
            ->whereHas('product')
            ->with('product:id,category_id')
            ->get()
            ->pluck('product.category_id')
            ->filter();

        $wishlistCategories = Wishlist::query()
            ->where('user_id', $user->id)
            ->whereHas('product')
            ->with('product:id,category_id')
            ->get()
            ->pluck('product.category_id')
            ->filter();

        $categoryIds = $categoryIds->merge($wishlistCategories)->unique()->values();

        if ($categoryIds->isEmpty()) {
            return Product::query()
                ->active()
                ->with(['category'])
                ->latest()
                ->limit($limit)
                ->get();
        }

        return Product::query()
            ->active()
            ->whereIn('category_id', $categoryIds)
            ->with(['category'])
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }
}
