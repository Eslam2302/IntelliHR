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
            'id'             => $this->id,
            'name'           => $this->name,
            'job_title'      => $this->job_title,
            'personal_email' => $this->personal_email,
            'phone'          => $this->phone,
            'hire_date'      => $this->hire_date,
            'department'     => $this->whenLoaded('department', function () {
                return [
                    'id'   => $this->department?->id,
                    'name' => $this->department?->name,
                ];
            }),
            'manager'        => $this->whenLoaded('manager', function () {
                return $this->manager ? [
                    'id'   => $this->manager->id,
                    'name' => $this->manager->name,
                ] : null;
            }),
            'user'           => $this->whenLoaded('user', function () {
                return $this->user ? [
                    'id'    => $this->user->id,
                    'email' => $this->user->email,
                ] : null;
            }),
            'created_at'     => $this->created_at?->format('Y-m-d H:i'),
            'updated_at'     => $this->updated_at?->format('Y-m-d H:i'),
        ];
    }
}