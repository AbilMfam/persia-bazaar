<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public const DEMO_EMAIL = 'demo@digimall.test';

    public function run(): void
    {
        User::firstOrCreate(
            ['email' => self::DEMO_EMAIL],
            [
                'name'     => 'Demo Seller',
                'password' => Hash::make('password'),
            ],
        );
    }
}
