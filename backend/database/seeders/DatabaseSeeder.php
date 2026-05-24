<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /** Slugs aligned with storefront `src/lib/data.ts`. */
    private const CATEGORY_SEEDS = [
        ['slug' => 'mobile', 'name' => 'موبایل'],
        ['slug' => 'fashion', 'name' => 'مد و پوشاک'],
        ['slug' => 'home', 'name' => 'خانه'],
        ['slug' => 'beauty', 'name' => 'زیبایی'],
        ['slug' => 'book', 'name' => 'کتاب'],
        ['slug' => 'sport', 'name' => 'ورزش'],
        ['slug' => 'toy', 'name' => 'اسباب‌بازی'],
        ['slug' => 'food', 'name' => 'خوراکی'],
    ];

    public function run(): void
    {
        foreach (self::CATEGORY_SEEDS as $row) {
            Category::query()->firstOrCreate(
                ['slug' => $row['slug']],
                ['name' => $row['name']],
            );
        }

        $demo = User::firstOrCreate(
            ['email' => 'demo@digimall.test'],
            [
                'name'     => 'Demo Seller',
                'password' => Hash::make('password'),
            ],
        );

        $samples = [
            ['title' => 'Samsung Galaxy S24 Ultra 256GB', 'price' => 58_900_000, 'description' => 'Flagship phone with 200MP camera and Snapdragon 8 Gen 3.', 'category' => 'mobile'],
            ['title' => 'Apple AirPods Pro 2nd Gen',      'price' => 9_450_000,  'description' => 'Wireless earbuds with active noise cancellation.', 'category' => 'mobile'],
            ['title' => 'Nike Air Zoom Pegasus 40',       'price' => 4_290_000,  'description' => 'Lightweight running shoes with Zoom Air cushioning.', 'category' => 'sport'],
            ['title' => 'Apple Watch Series 9 45mm',      'price' => 21_700_000, 'description' => 'Smartwatch with S9 chip and brighter display.', 'category' => 'mobile'],
            ['title' => 'Nivea Soft Moisturizer 200ml',   'price' => 285_000,    'description' => 'Light moisturizer with vitamin E and jojoba oil.', 'category' => 'beauty'],
            ['title' => 'Elif Shafak — The Forty Rules of Love', 'price' => 320_000, 'description' => 'Novel about Rumi and Shams of Tabriz.', 'category' => 'book'],
            ['title' => 'Granite Cookware Set 9 pieces',  'price' => 6_800_000,  'description' => 'Non-stick granite cookware with ergonomic handles.', 'category' => 'home'],
            ['title' => 'Cotton Crew-neck T-Shirt',       'price' => 480_000,    'description' => '100% cotton tee, soft fabric, daily wear.', 'category' => 'fashion'],
        ];

        foreach ($samples as $row) {
            Product::firstOrCreate(
                ['title' => $row['title']],
                [
                    'user_id'     => $demo->id,
                    'description' => $row['description'],
                    'category'    => $row['category'],
                    'price'       => $row['price'],
                    'image_url'   => 'https://picsum.photos/seed/'.urlencode($row['title']).'/600/600',
                ],
            );
        }

        Product::factory()->count(20)->create(['user_id' => $demo->id]);
    }
}
