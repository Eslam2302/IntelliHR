<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'employee_id',
        'doc_type',
        'file_path',
        'uploaded_at',
    ];

    /**
     * Relation: Each document belongs to one employee
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}