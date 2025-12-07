<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TrainingCertificateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'employee_training' => $this->whenLoaded('employeeTraining'),
            'issued_at' => $this->issued_at,
            'certificate_path' => $this->certificate_path,
        ];
    }
}