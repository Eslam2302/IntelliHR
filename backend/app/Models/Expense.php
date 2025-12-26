<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'amount',
        'expense_date',
        'category_id',
        'status',
        'receipt_path',
        'notes',
    ];

    protected $casts = [
        'expense_date' => 'datetime:Y-m-d',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }
}
