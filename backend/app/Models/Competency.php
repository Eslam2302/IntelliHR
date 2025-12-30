<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Competency extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'category',
        'applicable_to',
        'rating_descriptors',
        'weight',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'rating_descriptors' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('display_order');
    }

    public function scopeForLevel($query, string $level)
    {
        return $query->where(function ($q) use ($level) {
            $q->where('applicable_to', 'all')
                ->orWhere('applicable_to', $level);
        });
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Helper Methods
     */
    public function getRatingDescription(int $rating): ?string
    {
        return $this->rating_descriptors[$rating] ?? null;
    }
}
