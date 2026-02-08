<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetAssignmentResource extends JsonResource
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
            'asset_id' => $this->asset_id,
            'asset' => $this->whenLoaded('asset', function () {
                return [
                    'id' => $this->asset->id,
                    'name' => $this->asset->name,
                    'serial_number' => $this->asset->serial_number,
                    'status' => $this->asset->status,
                ];
            }),
            'employee_id' => $this->employee_id,
            'employee' => $this->whenLoaded('employee', function () {
                return [
                    'id' => $this->employee->id,
                    'name' => $this->employee->first_name . ' ' . $this->employee->last_name,
                    'email' => $this->employee->work_email,
                    'phone' => $this->employee->phone,
                ];
            }),
            'assigned_date' => $this->assigned_date?->format('Y-m-d'),
            'return_date' => $this->return_date?->format('Y-m-d'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}