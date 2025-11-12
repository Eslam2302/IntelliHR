<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{

    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'max_days_per_year',
        'is_paid',
        'requires_proof',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'requires_proof' => 'boolean',
        'max_days_per_year' => 'integer',
        'created_at',
        'updated_at',

    ];
}
