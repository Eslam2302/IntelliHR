<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainingCertificateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_training_id' => $this->employee_training_id,
            'issued_at' => $this->issued_at,
            'certificate_path' => $this->certificate_path,
            'employee_training' => $this->whenLoaded('employeeTraining', function () {
                if (! $this->employeeTraining) {
                    return null;
                }
                $et = $this->employeeTraining;
                $employeeName = $et->relationLoaded('employee') && $et->employee
                    ? trim(($et->employee->first_name ?? '') . ' ' . ($et->employee->last_name ?? ''))
                    : null;
                $trainingTitle = $et->relationLoaded('training') && $et->training
                    ? $et->training->title
                    : null;
                return [
                    'id' => $et->id,
                    'employee_name' => $employeeName,
                    'training_title' => $trainingTitle,
                    'display_label' => trim(($employeeName ?? 'Employee #' . $et->employee_id) . ' – ' . ($trainingTitle ?? 'Session #' . $et->training_id)),
                ];
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
