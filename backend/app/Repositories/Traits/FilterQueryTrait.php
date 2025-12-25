<?php

namespace App\Repositories\Traits;

use Illuminate\Database\Eloquent\Builder;

trait FilterQueryTrait
{
    /**
     * Apply filters to query: search, sort, and pagination
     */
    public function applyFilters(
        Builder $query,
        array $filters = [],
        array $searchableFields = [],
        array $allowedSortFields = [],
        string $defaultSort = 'id',
        string $defaultDirection = 'desc'
    ): Builder {
        // Apply search filter
        if (! empty($filters['search']) && ! empty($searchableFields)) {
            $query = $this->applySearch($query, $filters['search'], $searchableFields);
        }

        // Apply sort filter
        $sort = $filters['sort'] ?? $defaultSort;
        $direction = $filters['direction'] ?? $defaultDirection;

        // Validate sort column for security (SQL injection prevention)
        if (! empty($allowedSortFields) && ! in_array($sort, $allowedSortFields)) {
            $sort = $defaultSort;
        }

        $query->orderBy($sort, strtolower($direction) === 'asc' ? 'asc' : 'desc');

        return $query;
    }

    /**
     * Apply search filter with OR conditions across multiple fields
     */
    public function applySearch(
        Builder $query,
        string $searchTerm,
        array $searchableFields
    ): Builder {
        return $query->where(function ($q) use ($searchTerm, $searchableFields) {
            foreach ($searchableFields as $field) {
                // Handle nested relations like 'user.email' or 'trainer.employee.first_name'
                if (strpos($field, '.') !== false) {
                    $parts = explode('.', $field);

                    // Handle nested relations (2+ levels)
                    if (count($parts) >= 3) {
                        // For 'trainer.employee.first_name' -> whereHas('trainer.employee')
                        $relationPath = implode('.', array_slice($parts, 0, -1));
                        $column = end($parts);
                        $q->orWhereHas($relationPath, function ($subQuery) use ($column, $searchTerm) {
                            $subQuery->where($column, 'like', "%{$searchTerm}%");
                        });
                    } else {
                        // For 'user.email' -> whereHas('user')
                        [$relation, $column] = explode('.', $field);
                        $q->orWhereHas($relation, function ($subQuery) use ($column, $searchTerm) {
                            $subQuery->where($column, 'like', "%{$searchTerm}%");
                        });
                    }
                } else {
                    $q->orWhere($field, 'like', "%{$searchTerm}%");
                }
            }
        });
    }

    /**
     * Get pagination limit
     */
    public function getPaginationLimit(array $filters = [], int $default = 10, int $max = 100): int
    {
        $perPage = $filters['per_page'] ?? $default;

        // Prevent requesting too many items at once
        return min((int) $perPage, $max);
    }
}
