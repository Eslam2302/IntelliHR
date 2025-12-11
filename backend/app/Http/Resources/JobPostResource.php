<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'title'             => $this->title,
            'description'       => $this->description,
            'requirements'      => $this->requirements,
            'responsibilities'  => $this->responsibilities,
            'department_id'     => $this->department_id,
            'department'        => new DepartmentResource($this->whenLoaded('department')),

            'job_type'          => $this->job_type,
            'status'            => $this->status,
            'posted_at'         => $this->posted_at,
            'linkedin_job_id'   => $this->linkedin_job_id,

            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
        ];
    }
}
