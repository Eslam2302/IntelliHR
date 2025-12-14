<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Asset;


class AssetsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = ['available', 'assigned', 'maintenance', 'retired'];
        $conditions = ['new', 'used', 'worn'];

        for ($i = 1; $i <= 20; $i++) {
            Asset::create([
                'name' => fake()->word() . ' ' . fake()->randomElement(['Laptop', 'Monitor', 'Phone', 'Keyboard']),
                'serial_number' => 'SN' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'condition' => fake()->randomElement($conditions),
                'status' => fake()->randomElement($statuses),
            ]);
        }
    }
}