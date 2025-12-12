<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ExpenseCategory;

class ExpenseCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Transportation',
            'Meals',
            'Accommodation',
            'Office Supplies',
            'Software Purchase',
            'Internet',
            'Miscellaneous'
        ];

        foreach ($categories as $cat) {
            ExpenseCategory::create(['name' => $cat]);
        }
    }
}