<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /** Slugs aligned with storefront `src/lib/data.ts`. */
    public const SEEDS = [
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
        foreach (self::SEEDS as $row) {
            Category::query()->firstOrCreate(
                ['slug' => $row['slug']],
                ['name' => $row['name']],
            );
        }
    }
}
