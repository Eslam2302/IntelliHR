<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Employee;
use Illuminate\Support\Str;


class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = Employee::all();
        $categories = ExpenseCategory::all();

        foreach (range(1, 20) as $i) {
            Expense::create([
                'employee_id'   => $employees->random()->id,
                'amount'        => rand(50, 2000),
                'expense_date'  => now()->subDays(rand(1, 30))->format('Y-m-d'),
                'category_id'   => $categories->random()->id,
                'status'        => ['pending', 'approved', 'rejected'][array_rand(['pending', 'approved', 'rejected'])],
                'receipt_path'  => 'receipts/' . Str::random(10) . '.jpg'
            ]);
        }
    }
}
