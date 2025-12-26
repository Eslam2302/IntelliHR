<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'personal_email' => $this->personal_email,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'national_id' => $this->national_id,
            'birth_date' => $this->birth_date,
            'address' => $this->address,
            'employee_status' => $this->employee_status,
            'hire_date' => $this->hire_date,

            'department' => $this->whenLoaded('department', function () {
                return [
                    'id' => $this->department?->id,
                    'name' => $this->department?->name,
                ];
            }),
            'manager' => $this->whenLoaded('manager', function () {
                return $this->manager ? [
                    'id' => $this->manager->id,
                    'name' => $this->manager->name,
                ] : null;
            }),
            'job' => $this->whenLoaded('job', function () {
                return [
                    'id' => $this->job?->id,
                    'title' => $this->job?->title,
                    'grade' => $this->job?->grade,
                ];
            }),
            'user' => $this->whenLoaded('user', function () {
                return $this->user ? [
                    'id' => $this->user->id,
                    'email' => $this->user->email,
                ] : null;
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i'),
        ];
    }
}
