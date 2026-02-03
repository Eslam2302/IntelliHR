<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class DocumentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $fileUrl = null;
        if ($this->file_path) {
            $fileUrl = URL::temporarySignedRoute(
                'api.documents.file',
                now()->addMinutes(30),
                ['document' => $this->id]
            );
        }
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'name' => trim(($this->employee->first_name ?? '') . ' ' . ($this->employee->last_name ?? '')),
            ] : null,
            'doc_type' => $this->doc_type,
            'file_path' => $this->file_path,
            'file_url' => $fileUrl,
            'uploaded_at' => $this->uploaded_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
