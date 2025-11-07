<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * تحويل المورد إلى مصفوفة.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'guard_name' => $this->guard_name,

            'permissions' => $this->whenLoaded('permissions', function () {
                return $this->permissions->pluck('name');
            }),

            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}