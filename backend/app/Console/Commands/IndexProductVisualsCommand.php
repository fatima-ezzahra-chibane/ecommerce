<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\Ai\VisionSearchClient;
use Illuminate\Console\Command;

class IndexProductVisualsCommand extends Command
{
    protected $signature = 'products:index-visuals {--fresh : Réinitialiser l\'index avant indexation}';

    protected $description = 'Indexe les images produits dans le service computer vision (OpenCV ORB)';

    public function handle(VisionSearchClient $vision): int
    {
        $url = config('services.cv.url', 'http://cv-service:8090');
        $this->info("Connexion au service CV : {$url}");

        if (! $vision->waitUntilAvailable(30)) {
            $this->error('Service CV indisponible. Attendez quelques secondes puis relancez :');
            $this->line('  docker compose up -d cv-service');
            $this->line('  docker compose exec backend php artisan products:index-visuals --fresh');

            return self::FAILURE;
        }

        if ($this->option('fresh')) {
            \Illuminate\Support\Facades\Http::timeout(10)->delete(rtrim(config('services.cv.url'), '/').'/index');
            $this->info('Index CV réinitialisé.');
        }

        $products = Product::query()->where('status', 'active')->whereNotNull('image')->get();
        $ok = 0;
        $fail = 0;

        foreach ($products as $product) {
            $url = $this->resolveImageUrl($product->image);
            if (! $url) {
                $fail++;
                continue;
            }

            if ($vision->indexFromUrl($product->id, $url)) {
                $ok++;
                $this->line("  ✓ #{$product->id} {$product->name}");
            } else {
                $fail++;
                $this->warn("  ✗ #{$product->id} {$product->name}");
            }
        }

        $stats = $vision->stats();
        $this->info("Indexation terminée : {$ok} OK, {$fail} échec(s). Index CV : ".($stats['indexed_products'] ?? 0).' produit(s).');

        return self::SUCCESS;
    }

    private function resolveImageUrl(?string $image): ?string
    {
        if (! $image) {
            return null;
        }

        if (str_starts_with($image, 'http')) {
            return str_replace(
                ['http://localhost:8080', 'http://127.0.0.1:8080'],
                'http://nginx',
                $image
            );
        }

        $path = str_starts_with($image, '/') ? $image : '/'.$image;

        return 'http://nginx'.$path;
    }
}
