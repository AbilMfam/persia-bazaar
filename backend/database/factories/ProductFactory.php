<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'title'       => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'category'    => Category::query()->inRandomOrder()->value('slug') ?? 'mobile',
            'price'       => fake()->numberBetween(100_000, 50_000_000),
            'image_url'   => 'https://picsum.photos/seed/'.fake()->uuid().'/600/600',
        ];
    }
}
