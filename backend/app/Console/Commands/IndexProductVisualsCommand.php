<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\Ai\VisionSearchClient;
use Illuminate\Console\Command;

class IndexProductVisualsCommand extends Command
{
    protected $signature = 'products:index-visuals {--fresh : Réinitialiser l\'index avant indexation}';

    protected $description = 'Indexe les images produits dans le service computer vision (MobileNetV2 ONNX)';

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

        if ($this->option('fresh') && $vision->clearIndex()) {
            $this->info('Index CV réinitialisé.');
        }

        $products = Product::query()->active()->whereNotNull('image')->get();
        $ok = 0;
        $fail = 0;

        foreach ($products as $product) {
            if ($vision->syncProduct($product)) {
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
}
