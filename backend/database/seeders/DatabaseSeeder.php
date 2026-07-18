<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::forceCreate([
            'name' => 'Admin',
            'email' => 'admin@shop.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '0600000000',
        ]);

        User::forceCreate([
            'name' => 'Client Demo',
            'email' => 'client@shop.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        $categories = collect([
            ['name' => 'Électronique', 'slug' => 'electronique'],
            ['name' => 'Mode', 'slug' => 'mode'],
            ['name' => 'Maison', 'slug' => 'maison'],
        ])->map(fn ($c) => Category::create($c));

        $products = [
            ['name' => 'Smartphone Pro X', 'price' => 899.99, 'original_price' => 1199.99, 'stock' => 50, 'cat' => 0],
            ['name' => 'Casque Bluetooth', 'price' => 149.99, 'original_price' => null, 'stock' => 100, 'cat' => 0],
            ['name' => 'T-shirt Premium', 'price' => 29.99, 'original_price' => 49.99, 'stock' => 200, 'cat' => 1],
            ['name' => 'Jean Slim Fit', 'price' => 59.99, 'original_price' => null, 'stock' => 150, 'cat' => 1],
            ['name' => 'Lampe Design', 'price' => 79.99, 'original_price' => 99.99, 'stock' => 80, 'cat' => 2],
            ['name' => 'Coussin Déco', 'price' => 24.99, 'original_price' => null, 'stock' => 120, 'cat' => 2],
        ];

        foreach ($products as $p) {
            Product::create([
                'category_id' => $categories[$p['cat']]->id,
                'name' => $p['name'],
                'slug' => Str::slug($p['name']),
                'description' => "Description de {$p['name']}. Produit de qualité premium.",
                'price' => $p['price'],
                'original_price' => $p['original_price'],
                'stock' => $p['stock'],
                'image' => 'https://picsum.photos/seed/'.Str::slug($p['name']).'/400/400',
                'status' => 'active',
            ]);
        }

        Coupon::create([
            'code' => 'WELCOME10',
            'discount' => 10,
            'type' => 'percent',
            'expiration_date' => now()->addMonths(3),
        ]);
    }
}
