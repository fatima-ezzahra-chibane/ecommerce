<?php

namespace App\Services\Ai;

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

    public function indexFromUrl(int $productId, string $imageUrl): bool
    {
        try {
            $response = Http::timeout(60)->post($this->baseUrl().'/index/url', [
                'product_id' => $productId,
                'image_url' => $imageUrl,
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::warning('CV index failed', ['product_id' => $productId, 'message' => $e->getMessage()]);

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
}
