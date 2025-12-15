<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'action'    => $this->description,
            'module'    => $this->log_name,
            'subject'   => $this->subject_type ? class_basename($this->subject_type) : null,
            'subject_id' => $this->subject_id,
            'performed_by' => optional($this->causer)->name ?? 'System',
            'changes'   => $this->properties,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}