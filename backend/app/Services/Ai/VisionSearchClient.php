<?php

namespace App\Services\Ai;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VisionSearchClient
{
    public function isAvailable(): bool
    {
        try {
            $response = Http::timeout(5)->get($this->baseUrl().'/health');

            return $response->successful();
        } catch (\Throwable) {
            return false;
        }
    }

    public function waitUntilAvailable(int $maxSeconds = 30): bool
    {
        $deadline = time() + $maxSeconds;
        while (time() < $deadline) {
            if ($this->isAvailable()) {
                return true;
            }
            sleep(2);
        }

        return false;
    }

    public function stats(): array
    {
        try {
            $response = Http::timeout(5)->get($this->baseUrl().'/health');
            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $e) {
            Log::warning('CV service unreachable', ['message' => $e->getMessage()]);
        }

        return ['indexed_products' => 0, 'status' => 'unavailable'];
    }

    /** Seuls les produits actifs avec image sont indexés ; les autres sont retirés de l'index. */
    public function syncProduct(Product $product): bool
    {
        $imageUrl = $this->internalImageUrl($product->image);

        if ($product->status !== 'active' || ! $imageUrl) {
            return $this->removeProduct($product->id);
        }

        try {
            $response = Http::timeout(60)->post($this->baseUrl().'/index/url', [
                'product_id' => $product->id,
                'image_url' => $imageUrl,
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::warning('CV index failed', ['product_id' => $product->id, 'message' => $e->getMessage()]);

            return false;
        }
    }

    public function removeProduct(int $productId): bool
    {
        try {
            return Http::timeout(10)->delete($this->baseUrl().'/index/'.$productId)->successful();
        } catch (\Throwable $e) {
            Log::warning('CV index removal failed', ['product_id' => $productId, 'message' => $e->getMessage()]);

            return false;
        }
    }

    public function clearIndex(): bool
    {
        try {
            return Http::timeout(10)->delete($this->baseUrl().'/index')->successful();
        } catch (\Throwable $e) {
            Log::warning('CV index clear failed', ['message' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * @return array{product_id: ?int, match_count: int, confidence: float}
     */
    public function search(UploadedFile $image): array
    {
        $response = Http::timeout(60)
            ->attach('file', file_get_contents($image->getRealPath()), $image->getClientOriginalName())
            ->post($this->baseUrl().'/search');

        if (! $response->successful()) {
            throw new \RuntimeException('Service vision indisponible.');
        }

        return $response->json();
    }

    private function baseUrl(): string
    {
        return rtrim(config('services.cv.url', 'http://cv-service:8090'), '/');
    }

    /** URL joignable depuis le conteneur CV : les images locales passent par nginx. */
    private function internalImageUrl(?string $image): ?string
    {
        if (! $image) {
            return null;
        }

        if (str_starts_with($image, 'http')) {
            return str_replace(['http://localhost:8080', 'http://127.0.0.1:8080'], 'http://nginx', $image);
        }

        return 'http://nginx'.(str_starts_with($image, '/') ? $image : '/'.$image);
    }
}
