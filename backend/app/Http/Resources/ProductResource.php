<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'original_price' => $this->original_price,
            'stock' => $this->stock,
            'image' => $this->image_url,
            'status' => $this->status,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'average_rating' => $this->averageRating(),
            'created_at' => $this->created_at,
        ];
    }

    /** Fiche produit : avis chargés ; listes : withAvg('reviews', 'rating'). */
    private function averageRating(): ?float
    {
        if ($this->relationLoaded('reviews')) {
            return $this->reviews->isEmpty() ? null : round($this->reviews->avg('rating'), 1);
        }

        return $this->reviews_avg_rating !== null ? round((float) $this->reviews_avg_rating, 1) : null;
    }
}
